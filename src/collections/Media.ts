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
    // Avoid Admin crop UI; large cropped multipart POSTs hit Vercel 4.5MB limit.
    crop: false,
    focalPoint: false
  }
}
