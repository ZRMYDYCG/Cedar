import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'publishedAt', '_status']
  },
  versions: {
    drafts: true
  },
  access: {
    read: () => true
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true
    },
    {
      name: 'excerpt',
      type: 'textarea'
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media'
    },
    {
      name: 'coverUrl',
      type: 'text',
      admin: {
        description: 'External cover URL when Media upload is empty'
      }
    },
    {
      name: 'content',
      type: 'richText',
      required: true
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar'
      }
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar'
      }
    },
    {
      name: 'pinned',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar'
      }
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        position: 'sidebar'
      }
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        position: 'sidebar'
      }
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar'
      }
    }
  ]
}
