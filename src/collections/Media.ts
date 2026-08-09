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
      required: true,
      defaultValue: 'image'
    }
  ],
  upload: {
    // Crop/focal-point editing forces a large multipart POST through the
    // Vercel function (~4.5MB limit). Keep uploads on the client→Blob path.
    crop: false,
    focalPoint: false
  }
}
