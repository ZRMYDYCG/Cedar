import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'

import { prepareUploadBuffer } from '@/storage/gitee/optimize'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        // Drawer uploads often omit alt — fill from filename/id.
        if (data && !data.alt) {
          const name =
            (typeof data.filename === 'string' && data.filename) || 'image'
          data.alt = name.replace(/\.[^.]+$/, '') || name
        }
        return data
      }
    ],
    beforeChange: [
      async ({ data, req, operation, originalDoc }) => {
        // Sole place that may rename/compress. Adapter uploads this exact filename.
        const upload = req.file
        if (!upload?.data || !data) return data

        const buffer = Buffer.isBuffer(upload.data)
          ? upload.data
          : Buffer.from(upload.data)

        const prepared = await prepareUploadBuffer({
          buffer,
          filename:
            (typeof data.filename === 'string' && data.filename) ||
            upload.name ||
            'upload.bin',
          mimeType:
            (typeof data.mimeType === 'string') && data.mimeType
              ? data.mimeType
              : upload.mimetype || 'application/octet-stream'
        })

        // Same content ⇒ same filename id. Surface a clear error instead of
        // Payload's opaque "Value must be unique".
        if (operation === 'create' || operation === 'update') {
          const existing = await req.payload.find({
            collection: 'media',
            where: { filename: { equals: prepared.filename } },
            limit: 1,
            depth: 0,
            overrideAccess: true
          })
          const hit = existing.docs[0]
          const selfId = originalDoc?.id ?? data.id
          if (hit && String(hit.id) !== String(selfId ?? '')) {
            throw new APIError(
              `相同图片已存在（${prepared.filename}）。请直接从媒体库选择，无需重复上传。`,
              409
            )
          }
        }

        upload.data = prepared.buffer
        upload.size = prepared.buffer.byteLength
        upload.name = prepared.filename
        upload.mimetype = prepared.mimeType

        data.filename = prepared.filename
        data.mimeType = prepared.mimeType
        data.filesize = prepared.buffer.byteLength
        if (prepared.width) data.width = prepared.width
        if (prepared.height) data.height = prepared.height
        if (!data.alt) data.alt = prepared.id

        return data
      }
    ]
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: '留空时用文件名（内容 id）自动填充'
      }
    }
  ],
  upload: {
    crop: false,
    focalPoint: false,
    mimeTypes: ['image/*']
  }
}
