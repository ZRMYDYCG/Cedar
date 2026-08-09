import type { CollectionConfig } from 'payload'

export const Moments: CollectionConfig = {
  slug: 'moments',
  labels: {
    singular: '动态',
    plural: '朋友圈'
  },
  admin: {
    useAsTitle: 'content',
    defaultColumns: ['content', 'publishedAt', '_status'],
    description: '微信朋友圈式动态：文案 + 最多 9 张图'
  },
  versions: {
    drafts: true
  },
  access: {
    read: () => true
  },
  fields: [
    {
      name: 'content',
      type: 'textarea',
      required: true,
      label: '文案'
    },
    {
      name: 'images',
      type: 'array',
      label: '图片',
      maxRows: 9,
      labels: {
        singular: '图片',
        plural: '图片'
      },
      admin: {
        description: '最多 9 张，前台按微信朋友圈九宫格展示'
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true
        }
      ]
    },
    {
      name: 'location',
      type: 'text',
      label: '位置',
      admin: {
        position: 'sidebar'
      }
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: '发布时间',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime'
        }
      }
    }
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (data && operation === 'create' && !data.publishedAt) {
          data.publishedAt = new Date().toISOString()
        }
        return data
      }
    ]
  }
}
