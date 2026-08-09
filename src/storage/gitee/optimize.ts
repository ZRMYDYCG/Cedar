import { createHash } from 'crypto'
import path from 'path'
import sharp from 'sharp'

import {
  MAX_INPUT_BYTES,
  MAX_UPLOAD_BYTES,
  TARGET_UPLOAD_BYTES
} from './constants'
import { GiteeStorageError } from './client'

const MAX_EDGE = 1600
const HASH_SUFFIX_RE = /-[0-9a-f]{8}$/i

type PreparedFile = {
  buffer: Buffer
  filename: string
  mimeType: string
  width?: number
  height?: number
}

/**
 * Stable basename: strip trailing content-hash suffixes so prepareUploadBuffer
 * is idempotent (calling twice on the same bytes yields the same filename).
 */
function stableBaseName(filename: string): string {
  let name = path.parse(filename).name
  while (HASH_SUFFIX_RE.test(name)) {
    name = name.replace(HASH_SUFFIX_RE, '')
  }
  return name || 'upload'
}

/**
 * Filename is derived from the final buffer (sha256), not randomBytes.
 * Same bytes ⇒ same name — safe even if prepare runs more than once.
 * Different bytes ⇒ different name — avoids media.filename UNIQUE collisions
 * when many uploads would otherwise become the same basename.webp.
 */
export function contentFilename(
  filename: string,
  buffer: Buffer,
  ext?: string
): string {
  const parsed = path.parse(filename)
  const resolvedExt = ext ?? parsed.ext ?? ''
  const withDot = resolvedExt
    ? resolvedExt.startsWith('.')
      ? resolvedExt
      : `.${resolvedExt}`
    : ''
  const hash = createHash('sha256').update(buffer).digest('hex').slice(0, 8)
  return `${stableBaseName(filename)}-${hash}${withDot}`
}

/**
 * Compress / resize raster images for fast Gitee Contents API uploads.
 * SVG/GIF pass through (size-checked) with a content-hashed filename.
 * Other rasters become content-hashed WebP aimed at TARGET_UPLOAD_BYTES.
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
    return {
      buffer,
      filename: contentFilename(filename, buffer),
      mimeType
    }
  }

  if (buffer.byteLength > MAX_INPUT_BYTES) {
    throw new GiteeStorageError(
      `Source image too large (${buffer.byteLength} bytes). Max ${MAX_INPUT_BYTES} bytes before compression.`
    )
  }

  // Already a small webp — keep bytes, hash the name from those bytes.
  if (mimeType === 'image/webp' && buffer.byteLength <= TARGET_UPLOAD_BYTES) {
    return {
      buffer,
      filename: contentFilename(filename, buffer, '.webp'),
      mimeType
    }
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
        // Name from final bytes so quality retries that land on the same
        // buffer stay stable; different quality ⇒ different hash if bytes differ.
        filename: contentFilename(filename, out.data, '.webp'),
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
