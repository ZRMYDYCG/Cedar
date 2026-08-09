import type { CollectionConfig } from 'payload'

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
