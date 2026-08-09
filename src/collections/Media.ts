import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true
    }
  ],
  upload: {
    // Gitee Contents API + Vercel function body: keep uploads small (enforced in adapter, 2MB).
    crop: false,
    focalPoint: false,
    mimeTypes: ['image/*']
  }
}
