import type { CollectionConfig } from 'payload'

import { prepareUploadBuffer } from '@/storage/gitee/optimize'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        // Drawer uploads (e.g. Moments) often omit alt — default so create can proceed.
        if (data && !data.alt && typeof data.filename === 'string') {
          data.alt = data.filename.replace(/\.[^.]+$/, '') || data.filename
        }
        return data
      }
    ],
    beforeChange: [
      async ({ data, req }) => {
        // Normalize/compress BEFORE the DB row is written so afterChange Gitee
        // upload never needs a follow-up payload.update (stale conn → Not Found).
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
            (typeof data.mimeType === 'string' && data.mimeType) ||
            upload.mimetype ||
            'application/octet-stream'
        })

        upload.data = prepared.buffer
        upload.size = prepared.buffer.byteLength
        upload.name = prepared.filename
        upload.mimetype = prepared.mimeType

        data.filename = prepared.filename
        data.mimeType = prepared.mimeType
        data.filesize = prepared.buffer.byteLength
        if (prepared.width) data.width = prepared.width
        if (prepared.height) data.height = prepared.height

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
        description: '留空时会用文件名自动填充'
      }
    }
  ],
  upload: {
    // Gitee Contents API + Vercel function body: keep uploads small (enforced in adapter, 2MB).
    crop: false,
    focalPoint: false,
    mimeTypes: ['image/*']
  }
}
