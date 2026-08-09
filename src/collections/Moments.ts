import type { CollectionConfig, PayloadRequest } from 'payload'
import { ValidationError } from 'payload'

function mediaIdFrom(value: unknown): number | string | null {
  if (value == null) return null
  if (typeof value === 'number' || typeof value === 'string') return value
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id?: number | string }).id
    return id == null ? null : id
  }
  return null
}

async function assertMomentImagesExist(
  images: unknown,
  req: PayloadRequest
): Promise<void> {
  if (!Array.isArray(images) || images.length === 0) return

  const errors: { message: string; path: string }[] = []

  await Promise.all(
    images.map(async (row, index) => {
      const id = mediaIdFrom(
        row && typeof row === 'object' ? (row as { image?: unknown }).image : null
      )
      if (id == null) {
        errors.push({
          path: `images.${index}.image`,
          message: '请上传图片'
        })
        return
      }

      try {
        await req.payload.findByID({
          collection: 'media',
          id,
          depth: 0,
          overrideAccess: true,
          req
        })
      } catch {
        errors.push({
          path: `images.${index}.image`,
          message: '图片已失效（多为上次上传失败留下的无效引用），请移除后重新上传'
        })
      }
    })
  )

  if (errors.length > 0) {
    throw new ValidationError({
      collection: 'moments',
      errors,
      req
    })
  }
}

export const Moments: CollectionConfig = {
  slug: 'moments',
  labels: {
    singular: '小记',
    plural: '人生小记'
  },
  admin: {
    useAsTitle: 'content',
    defaultColumns: ['content', 'publishedAt', '_status'],
    description: '人生小记：文案 + 最多 9 张图'
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
        description:
          '最多 9 张。若保存提示图片失效，请删掉该图重新上传（不要沿用上传失败时的预览）。'
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
    beforeValidate: [
      async ({ data, req }) => {
        if (data?.images) {
          await assertMomentImagesExist(data.images, req)
        }
        return data
      }
    ],
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
