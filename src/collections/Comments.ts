import type { CollectionConfig, PayloadRequest } from 'payload'
import { ValidationError } from 'payload'

const MAX = {
  target: 200,
  authorName: 40,
  authorEmail: 120,
  authorUrl: 200,
  content: 2000
} as const

function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, '')
}

function parentIdOf(value: unknown): number | string | null {
  if (value == null) return null
  if (typeof value === 'number' || typeof value === 'string') return value
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id?: number | string }).id
    return id == null ? null : id
  }
  return null
}

async function assertParentValid(
  data: Record<string, unknown> | undefined,
  req: PayloadRequest
): Promise<void> {
  if (!data) return
  const parentId = parentIdOf(data.parent)
  if (parentId == null) return

  const target =
    typeof data.target === 'string' ? data.target.trim() : ''

  let parent
  try {
    parent = await req.payload.findByID({
      collection: 'comments',
      id: parentId,
      depth: 0,
      overrideAccess: true,
      req
    })
  } catch {
    throw new ValidationError({
      errors: [{ message: '回复的评论不存在', path: 'parent' }]
    })
  }

  if (parent.parent) {
    throw new ValidationError({
      errors: [{ message: '只能回复一层，不能回复子评论', path: 'parent' }]
    })
  }

  if (target && parent.target !== target) {
    throw new ValidationError({
      errors: [{ message: '回复必须属于同一页面', path: 'parent' }]
    })
  }
}

export const Comments: CollectionConfig = {
  slug: 'comments',
  labels: {
    singular: '评论',
    plural: '评论'
  },
  admin: {
    useAsTitle: 'content',
    defaultColumns: ['authorName', 'target', 'targetKind', 'createdAt'],
    description: '站点前台评论（提交即公开，可在此删除垃圾评论）'
  },
  access: {
    read: () => true,
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user)
  },
  hooks: {
    beforeValidate: [
      async ({ data, req }) => {
        if (!data) return data

        if (typeof data.target === 'string') {
          data.target = data.target.trim()
        }
        if (typeof data.authorName === 'string') {
          data.authorName = data.authorName.trim()
        }
        if (typeof data.authorEmail === 'string') {
          data.authorEmail = data.authorEmail.trim()
        }
        if (typeof data.authorUrl === 'string') {
          data.authorUrl = data.authorUrl.trim()
        }
        if (typeof data.content === 'string') {
          data.content = stripTags(data.content).trim()
        }

        const target = typeof data.target === 'string' ? data.target : ''
        if (!target || /\s/.test(target) || target.length > MAX.target) {
          throw new ValidationError({
            errors: [{ message: '评论目标无效', path: 'target' }]
          })
        }

        const name =
          typeof data.authorName === 'string' ? data.authorName : ''
        if (!name || name.length > MAX.authorName) {
          throw new ValidationError({
            errors: [{ message: '请填写昵称（最多 40 字）', path: 'authorName' }]
          })
        }

        const content =
          typeof data.content === 'string' ? data.content : ''
        if (!content || content.length > MAX.content) {
          throw new ValidationError({
            errors: [
              {
                message: `请填写评论内容（最多 ${MAX.content} 字）`,
                path: 'content'
              }
            ]
          })
        }

        if (
          typeof data.authorEmail === 'string' &&
          data.authorEmail.length > MAX.authorEmail
        ) {
          throw new ValidationError({
            errors: [{ message: '邮箱过长', path: 'authorEmail' }]
          })
        }

        if (
          typeof data.authorUrl === 'string' &&
          data.authorUrl.length > 0
        ) {
          if (data.authorUrl.length > MAX.authorUrl) {
            throw new ValidationError({
              errors: [{ message: '网址过长', path: 'authorUrl' }]
            })
          }
          if (!/^https?:\/\//i.test(data.authorUrl)) {
            throw new ValidationError({
              errors: [
                { message: '网址需以 http:// 或 https:// 开头', path: 'authorUrl' }
              ]
            })
          }
        }

        await assertParentValid(data as Record<string, unknown>, req)
        return data
      }
    ]
  },
  fields: [
    {
      name: 'target',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: '对应前台 Comment uid（文章 slug / about / links 等）'
      }
    },
    {
      name: 'targetKind',
      type: 'select',
      required: true,
      defaultValue: 'post',
      options: [
        { label: '文章', value: 'post' },
        { label: '页面', value: 'page' },
        { label: '关于', value: 'about' },
        { label: '友链', value: 'links' }
      ]
    },
    {
      name: 'content',
      type: 'textarea',
      required: true
    },
    {
      name: 'authorName',
      type: 'text',
      required: true
    },
    {
      name: 'authorEmail',
      type: 'email',
      access: {
        read: ({ req }) => Boolean(req.user)
      }
    },
    {
      name: 'authorUrl',
      type: 'text'
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: '关联后前台显示「博主」标识'
      }
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'comments',
      admin: {
        description: '一层回复：只能指向顶级评论'
      }
    }
  ]
}
