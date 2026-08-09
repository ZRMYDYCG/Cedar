import { safeCms } from '@/data/cms/safe'
import { encodePathSegment } from '@/lib/path-segment'
import { getPayloadClient } from '@/lib/payload'
import type { Comment, User } from '@/payload-types'

export type CommentTargetKind = 'post' | 'page' | 'about' | 'links'

export type CommentCard = {
  id: number
  target: string
  targetKind: CommentTargetKind
  content: string
  authorName: string
  authorUrl?: string | null
  isAdmin: boolean
  parentId?: number | null
  createdAt: string
}

export type CreateCommentInput = {
  target: string
  targetKind: CommentTargetKind
  content: string
  authorName: string
  authorEmail?: string
  authorUrl?: string
  parent?: number
  /** Honeypot — if non-empty, treat as spam (no create). */
  company?: string
}

function mapComment(doc: Comment): CommentCard {
  const parentId =
    typeof doc.parent === 'object' && doc.parent
      ? doc.parent.id
      : typeof doc.parent === 'number'
        ? doc.parent
        : null

  const isAdmin = Boolean(
    doc.author &&
      (typeof doc.author === 'object' || typeof doc.author === 'number')
  )

  let authorName = doc.authorName
  if (typeof doc.author === 'object' && doc.author) {
    const user = doc.author as User
    authorName = user.name || doc.authorName
  }

  return {
    id: doc.id,
    target: doc.target,
    targetKind: (doc.targetKind || 'post') as CommentTargetKind,
    content: doc.content,
    authorName,
    authorUrl: doc.authorUrl,
    isAdmin,
    parentId,
    createdAt: doc.createdAt
  }
}

export function commentHref(comment: Pick<CommentCard, 'target' | 'targetKind'>): string {
  switch (comment.targetKind) {
    case 'about':
      return '/about'
    case 'links':
      return '/links'
    case 'page':
      return `/page/${encodePathSegment(comment.target)}`
    case 'post':
    default:
      return `/post/${encodePathSegment(comment.target)}`
  }
}

export async function getCommentsByTarget(
  target: string,
  limit = 100
): Promise<CommentCard[]> {
  return safeCms(
    `getCommentsByTarget:${target}`,
    async () => {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'comments',
        where: { target: { equals: target } },
        sort: 'createdAt',
        limit,
        depth: 1,
        overrideAccess: false
      })
      return (result.docs as Comment[]).map(mapComment)
    },
    []
  )
}

export async function getRecentComments(limit = 8): Promise<CommentCard[]> {
  return safeCms(
    'getRecentComments',
    async () => {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'comments',
        sort: '-createdAt',
        limit,
        depth: 0,
        overrideAccess: false
      })
      return (result.docs as Comment[]).map(mapComment)
    },
    []
  )
}

/** Client-side create via Payload REST. Returns null if honeypot tripped. */
export async function createComment(
  input: CreateCommentInput
): Promise<CommentCard | null> {
  if (input.company?.trim()) {
    return null
  }

  const body: Record<string, unknown> = {
    target: input.target,
    targetKind: input.targetKind,
    content: input.content,
    authorName: input.authorName
  }
  if (input.authorEmail?.trim()) body.authorEmail = input.authorEmail.trim()
  if (input.authorUrl?.trim()) body.authorUrl = input.authorUrl.trim()
  if (input.parent != null) body.parent = input.parent

  const res = await fetch('/api/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const data = (await res.json()) as {
        errors?: { message?: string }[]
        message?: string
      }
      message =
        data.errors?.[0]?.message || data.message || message
    } catch {
      /* ignore */
    }
    throw new Error(message)
  }

  const data = (await res.json()) as { doc?: Comment }
  if (!data.doc) {
    throw new Error('创建评论失败')
  }
  return mapComment(data.doc)
}

export function groupComments(comments: CommentCard[]): {
  roots: CommentCard[]
  repliesByParent: Record<number, CommentCard[]>
} {
  const repliesByParent: Record<number, CommentCard[]> = {}
  const roots: CommentCard[] = []

  for (const comment of comments) {
    if (comment.parentId != null) {
      const key = comment.parentId
      if (!repliesByParent[key]) repliesByParent[key] = []
      repliesByParent[key].push(comment)
    } else {
      roots.push(comment)
    }
  }

  return { roots, repliesByParent }
}
