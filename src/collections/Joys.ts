import type { CollectionConfig } from 'payload'
import { ValidationError } from 'payload'

function dayKey(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}

export const Joys: CollectionConfig = {
  slug: 'joys',
  labels: {
    singular: '开心事',
    plural: '三件开心事'
  },
  admin: {
    useAsTitle: 'day',
    defaultColumns: ['day', 'item1', 'item2', 'item3', '_status'],
    description: '每天记录三件开心事；前台页面 /joys 按日期展示。'
  },
  versions: {
    drafts: true
  },
  access: {
    read: () => true
  },
  fields: [
    {
      name: 'day',
      type: 'date',
      required: true,
      unique: true,
      label: '日期',
      admin: {
        date: {
          pickerAppearance: 'dayOnly'
        },
        description: '一天一条；同一天请编辑已有记录'
      }
    },
    {
      name: 'item1',
      type: 'textarea',
      required: true,
      label: '开心事 ①'
    },
    {
      name: 'item2',
      type: 'textarea',
      required: true,
      label: '开心事 ②'
    },
    {
      name: 'item3',
      type: 'textarea',
      required: true,
      label: '开心事 ③'
    },
    {
      name: 'note',
      type: 'textarea',
      label: '备注（选填）',
      admin: {
        description: '不显示在前台，仅自己备忘'
      }
    }
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation, originalDoc }) => {
        if (!data) return data
        const key = dayKey(data.day)
        if (!key) {
          throw new ValidationError({
            errors: [{ message: '请选择有效日期', path: 'day' }]
          })
        }

        // Normalize to noon UTC so day-only values stay stable across TZ.
        data.day = `${key}T12:00:00.000Z`

        const existing = await req.payload.find({
          collection: 'joys',
          where: { day: { equals: data.day } },
          limit: 1,
          depth: 0,
          overrideAccess: true,
          req
        })
        const hit = existing.docs[0]
        const selfId = originalDoc?.id
        if (
          hit &&
          (operation === 'create' || String(hit.id) !== String(selfId ?? ''))
        ) {
          throw new ValidationError({
            errors: [
              {
                message: `${key} 已有记录，请打开那天的条目编辑，不要新建重复日期。`,
                path: 'day'
              }
            ]
          })
        }

        return data
      }
    ]
  }
}
