import { createHash } from 'crypto'
import sharp from 'sharp'

import {
  MAX_INPUT_BYTES,
  MAX_UPLOAD_BYTES,
  TARGET_UPLOAD_BYTES
} from './constants'
import { GiteeStorageError } from './client'

const MAX_EDGE = 1600

export type PreparedMedia = {
  /** Content id = sha256(final bytes).slice(0, 16). Also the filename stem. */
  id: string
  /** Always `${id}${ext}` — CMS filename === Gitee object basename. */
  filename: string
  buffer: Buffer
  mimeType: string
  width?: number
  height?: number
}

/** Filename is the id. Same bytes ⇒ same name; CMS and Gitee must use this exact string. */
export function mediaFilenameFromBuffer(buffer: Buffer, ext: string): {
  id: string
  filename: string
} {
  const id = createHash('sha256').update(buffer).digest('hex').slice(0, 16)
  const withDot = ext.startsWith('.') ? ext : `.${ext}`
  return { id, filename: `${id}${withDot}` }
}

/**
 * One-shot prepare for Media uploads:
 * compress → hash final bytes → filename = that hash.
 * Never call this from the Gitee adapter (that would rename after DB write).
 */
export async function prepareUploadBuffer(file: {
  buffer: Buffer
  filename: string
  mimeType: string
}): Promise<PreparedMedia> {
  const { buffer, mimeType } = file

  const passthrough =
    !mimeType.startsWith('image/') ||
    mimeType === 'image/svg+xml' ||
    mimeType === 'image/gif'

  if (passthrough) {
    if (buffer.byteLength > MAX_UPLOAD_BYTES) {
      throw new GiteeStorageError(
        `文件过大（${buffer.byteLength} 字节）。图床上限 ${MAX_UPLOAD_BYTES} 字节。`
      )
    }
    const ext =
      mimeType === 'image/svg+xml'
        ? '.svg'
        : mimeType === 'image/gif'
          ? '.gif'
          : '.bin'
    const named = mediaFilenameFromBuffer(buffer, ext)
    return { ...named, buffer, mimeType }
  }

  if (buffer.byteLength > MAX_INPUT_BYTES) {
    throw new GiteeStorageError(
      `原图过大（${buffer.byteLength} 字节）。压缩前上限 ${MAX_INPUT_BYTES} 字节。`
    )
  }

  if (mimeType === 'image/webp' && buffer.byteLength <= TARGET_UPLOAD_BYTES) {
    const meta = await sharp(buffer, { failOn: 'none' }).metadata()
    const named = mediaFilenameFromBuffer(buffer, '.webp')
    return {
      ...named,
      buffer,
      mimeType: 'image/webp',
      width: meta.width,
      height: meta.height
    }
  }

  const qualities = [78, 68, 58, 48, 38]
  let lastError: unknown
  let smallest: { buffer: Buffer; width?: number; height?: number } | undefined

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

      const candidate = {
        buffer: out.data,
        width: out.info.width || meta.width,
        height: out.info.height || meta.height
      }

      if (!smallest || candidate.buffer.byteLength < smallest.buffer.byteLength) {
        smallest = candidate
      }

      if (candidate.buffer.byteLength <= TARGET_UPLOAD_BYTES) {
        const named = mediaFilenameFromBuffer(candidate.buffer, '.webp')
        return {
          ...named,
          buffer: candidate.buffer,
          mimeType: 'image/webp',
          width: candidate.width,
          height: candidate.height
        }
      }
    } catch (err) {
      lastError = err
    }
  }

  if (smallest && smallest.buffer.byteLength <= MAX_UPLOAD_BYTES) {
    const named = mediaFilenameFromBuffer(smallest.buffer, '.webp')
    return {
      ...named,
      buffer: smallest.buffer,
      mimeType: 'image/webp',
      width: smallest.width,
      height: smallest.height
    }
  }

  throw new GiteeStorageError(
    `无法将图片压到 ${MAX_UPLOAD_BYTES} 字节以内${
      lastError instanceof Error ? `：${lastError.message}` : ''
    }`
  )
}
