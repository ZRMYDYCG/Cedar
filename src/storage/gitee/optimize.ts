import path from 'path'
import sharp from 'sharp'

import {
  MAX_INPUT_BYTES,
  MAX_UPLOAD_BYTES,
  TARGET_UPLOAD_BYTES
} from './constants'
import { GiteeStorageError } from './client'

const MAX_EDGE = 1600

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
 * Compress / resize raster images for fast Gitee Contents API uploads.
 * SVG/GIF pass through unchanged (with hard size check).
 * Other rasters are converted to WebP and aimed at TARGET_UPLOAD_BYTES.
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

  // Already a small webp — skip re-encode for speed.
  if (
    mimeType === 'image/webp' &&
    buffer.byteLength <= TARGET_UPLOAD_BYTES
  ) {
    return { buffer, filename, mimeType }
  }

  const qualities = [78, 68, 58, 48, 38]
  let lastError: unknown
  let smallest: PreparedFile | undefined

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
        .webp({ quality, effort: 2 })
        .toBuffer({ resolveWithObject: true })

      const candidate: PreparedFile = {
        buffer: out.data,
        filename: withExt(filename, '.webp'),
        mimeType: 'image/webp',
        width: out.info.width || meta.width,
        height: out.info.height || meta.height
      }

      if (
        !smallest ||
        candidate.buffer.byteLength < smallest.buffer.byteLength
      ) {
        smallest = candidate
      }

      if (candidate.buffer.byteLength <= TARGET_UPLOAD_BYTES) {
        return candidate
      }
    } catch (err) {
      lastError = err
    }
  }

  if (smallest && smallest.buffer.byteLength <= MAX_UPLOAD_BYTES) {
    return smallest
  }

  throw new GiteeStorageError(
    `Could not compress image under ${MAX_UPLOAD_BYTES} bytes${
      lastError instanceof Error ? `: ${lastError.message}` : ''
    }`
  )
}
