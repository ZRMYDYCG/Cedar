import type { Adapter, GeneratedAdapter } from '@payloadcms/plugin-cloud-storage/types'
import { getFileKey, getFilePrefix } from '@payloadcms/plugin-cloud-storage/utilities'
import type { CollectionSlug } from 'payload'

import {
  deleteGiteeFile,
  fetchGiteeRaw,
  type GiteeConfig,
  uploadGiteeFile
} from './client'
import { prepareUploadBuffer } from './optimize'

type CreateGiteeAdapterArgs = {
  config: GiteeConfig
  cacheControlMaxAge?: number
}

function guessContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'gif':
      return 'image/gif'
    case 'webp':
      return 'image/webp'
    case 'svg':
      return 'image/svg+xml'
    case 'avif':
      return 'image/avif'
    default:
      return 'application/octet-stream'
  }
}

export function createGiteeAdapter({
  config,
  cacheControlMaxAge = 60 * 60 * 24 * 365
}: CreateGiteeAdapterArgs): Adapter {
  return ({ collection, prefix: collectionPrefix = '' }): GeneratedAdapter => ({
    name: 'gitee',
    handleUpload: async ({ data, file, req }) => {
      const originalFilename = file.filename
      const originalMimeType = file.mimeType
      const originalFilesize = file.filesize

      const prepared = await prepareUploadBuffer({
        buffer: file.buffer,
        filename: file.filename,
        mimeType: file.mimeType
      })

      // Keep in-memory file/doc in sync for the Gitee object key.
      file.buffer = prepared.buffer
      file.filename = prepared.filename
      file.mimeType = prepared.mimeType
      file.filesize = prepared.buffer.byteLength
      data.filename = prepared.filename
      data.mimeType = prepared.mimeType
      data.filesize = prepared.buffer.byteLength
      if (prepared.width) data.width = prepared.width
      if (prepared.height) data.height = prepared.height

      const { fileKey } = getFileKey({
        collectionPrefix,
        docPrefix: data.prefix,
        filename: prepared.filename
      })

      await uploadGiteeFile({
        config,
        filePath: fileKey,
        buffer: prepared.buffer,
        message: `upload ${fileKey}`
      })

      // IMPORTANT: plugin-cloud-storage calls payload.update() whenever
      // handleUpload returns an object. Returning the full `data` doc made
      // that follow-up update throw Payload "Not Found" after slow Gitee
      // uploads → POST /api/media 404, Admin stuck, file already on Gitee.
      //
      // - No metadata change: return void (skip plugin update).
      // - Metadata change (e.g. compressed to webp): persist a minimal patch
      //   ourselves with overrideAccess, then return void so the plugin does
      //   not run its own update.
      const metadataChanged =
        prepared.filename !== originalFilename ||
        prepared.mimeType !== originalMimeType ||
        prepared.buffer.byteLength !== originalFilesize ||
        Boolean(prepared.width) ||
        Boolean(prepared.height)

      if (!metadataChanged || data?.id == null) return

      const patch = {
        filename: prepared.filename,
        mimeType: prepared.mimeType,
        filesize: prepared.buffer.byteLength,
        ...(prepared.width ? { width: prepared.width } : {}),
        ...(prepared.height ? { height: prepared.height } : {})
      }

      if (!req.context) req.context = {}
      req.context.skipCloudStorage = true
      try {
        await req.payload.update({
          id: data.id,
          collection: collection.slug as CollectionSlug,
          data: patch,
          depth: 0,
          overrideAccess: true,
          req
        })
      } finally {
        delete req.context.skipCloudStorage
      }
    },
    handleDelete: async ({ doc, filename }) => {
      const { fileKey } = getFileKey({
        collectionPrefix,
        docPrefix: doc.prefix,
        filename
      })

      await deleteGiteeFile({
        config,
        filePath: fileKey,
        message: `delete ${fileKey}`
      })
    },
    generateURL: ({ filename, prefix }) => {
      // Only used when disablePayloadAccessControl=true; default URLs stay on /api/media/file/...
      const prefixQuery = prefix
        ? `?prefix=${encodeURIComponent(prefix)}`
        : collectionPrefix
          ? `?prefix=${encodeURIComponent(collectionPrefix)}`
          : ''
      return `/api/${collection.slug}/file/${encodeURIComponent(filename)}${prefixQuery}`
    },
    staticHandler: async (req, { headers: incomingHeaders, params }) => {
      try {
        const docPrefix = await getFilePrefix({
          clientUploadContext: params.clientUploadContext,
          collection,
          filename: params.filename,
          prefixQueryParam: params.prefix,
          req
        })

        const { fileKey } = getFileKey({
          collectionPrefix,
          docPrefix,
          filename: params.filename
        })

        const upstream = await fetchGiteeRaw({ config, filePath: fileKey })

        if (upstream.status === 404) {
          return new Response(null, { status: 404, statusText: 'Not Found' })
        }

        if (!upstream.ok || !upstream.body) {
          req.payload.logger.error({
            msg: 'Gitee raw fetch failed',
            status: upstream.status,
            fileKey
          })
          return new Response('Bad Gateway', { status: 502 })
        }

        const contentType =
          upstream.headers.get('content-type') || guessContentType(params.filename)

        let headers = new Headers(incomingHeaders)
        headers.set('Content-Type', contentType)
        headers.set('Cache-Control', `public, max-age=${cacheControlMaxAge}, immutable`)

        if (contentType === 'image/svg+xml') {
          headers.set('Content-Security-Policy', "script-src 'none'")
        }

        if (
          collection.upload &&
          typeof collection.upload === 'object' &&
          typeof collection.upload.modifyResponseHeaders === 'function'
        ) {
          headers =
            collection.upload.modifyResponseHeaders({ headers }) || headers
        }

        return new Response(upstream.body, {
          headers,
          status: 200
        })
      } catch (err) {
        req.payload.logger.error({
          err,
          msg: 'Unexpected error in Gitee staticHandler'
        })
        return new Response('Internal Server Error', { status: 500 })
      }
    }
  })
}
