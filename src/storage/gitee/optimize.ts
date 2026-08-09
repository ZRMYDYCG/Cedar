import path from 'path'
import sharp from 'sharp'

import { MAX_INPUT_BYTES, MAX_UPLOAD_BYTES } from './constants'
import { GiteeStorageError } from './client'

const MAX_EDGE = 2000

type PreparedFile = {
  buffer: Buffer
  filename: string
  mimeType: string
  width?: number
  height?: number
}

function withExt(filename: string, ext: string): string {
  const parsed = path.parse(filename)
  return `${parsed.name}${ext}`
}

/**
 * Compress / resize raster images so they fit Gitee Contents API (~2MB).
 * SVG/GIF pass through unchanged (with hard size check).
 * Files already ≤2MB are uploaded as-is.
 */
export async function prepareUploadBuffer(file: {
  buffer: Buffer
  filename: string
  mimeType: string
}): Promise<PreparedFile> {
  const { buffer, filename, mimeType } = file

  const passthrough =
    !mimeType.startsWith('image/') ||
    mimeType === 'image/svg+xml' ||
    mimeType === 'image/gif'

  if (passthrough) {
    if (buffer.byteLength > MAX_UPLOAD_BYTES) {
      throw new GiteeStorageError(
        `File too large (${buffer.byteLength} bytes). Max ${MAX_UPLOAD_BYTES} bytes for Gitee storage.`
      )
    }
    return { buffer, filename, mimeType }
  }

  if (buffer.byteLength > MAX_INPUT_BYTES) {
    throw new GiteeStorageError(
      `Source image too large (${buffer.byteLength} bytes). Max ${MAX_INPUT_BYTES} bytes before compression.`
    )
  }

  if (buffer.byteLength <= MAX_UPLOAD_BYTES) {
    return { buffer, filename, mimeType }
  }

  const qualities = [82, 72, 62, 52, 42]
  let lastError: unknown

  for (const quality of qualities) {
    try {
      const image = sharp(buffer, { failOn: 'none' }).rotate()
      const meta = await image.metadata()
      const out = await image
        .resize({
          width: MAX_EDGE,
          height: MAX_EDGE,
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality, effort: 4 })
        .toBuffer({ resolveWithObject: true })

      if (out.data.byteLength <= MAX_UPLOAD_BYTES) {
        return {
          buffer: out.data,
          filename: withExt(filename, '.webp'),
          mimeType: 'image/webp',
          width: out.info.width || meta.width,
          height: out.info.height || meta.height
        }
      }
    } catch (err) {
      lastError = err
    }
  }

  throw new GiteeStorageError(
    `Could not compress image under ${MAX_UPLOAD_BYTES} bytes${
      lastError instanceof Error ? `: ${lastError.message}` : ''
    }`
  )
}
