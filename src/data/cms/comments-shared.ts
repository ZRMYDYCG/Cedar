import { encodePathSegment } from '@/lib/path-segment'

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

/** Normalize Payload REST / Local API comment docs for the UI. */
export function mapCommentDoc(doc: {
  id: number
  target: string
  targetKind?: CommentTargetKind | null
  content: string
  authorName: string
  authorUrl?: string | null
  author?: unknown
  parent?: number | { id: number } | null
  createdAt: string
}): CommentCard {
  const parentId =
    typeof doc.parent === 'object' && doc.parent
      ? doc.parent.id
      : typeof doc.parent === 'number'
        ? doc.parent
        : null

  let authorName = doc.authorName
  if (doc.author && typeof doc.author === 'object' && 'name' in doc.author) {
    const name = (doc.author as { name?: string | null }).name
    if (name) authorName = name
  }

  return {
    id: doc.id,
    target: doc.target,
    targetKind: (doc.targetKind || 'post') as CommentTargetKind,
    content: doc.content,
    authorName,
    authorUrl: doc.authorUrl,
    isAdmin: Boolean(doc.author),
    parentId,
    createdAt: doc.createdAt
  }
}

export function commentHref(
  comment: Pick<CommentCard, 'target' | 'targetKind'>
): string {
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

/** Client-safe create via Payload REST. Returns null if honeypot tripped. */
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
      message = data.errors?.[0]?.message || data.message || message
    } catch {
      /* ignore */
    }
    throw new Error(message)
  }

  const data = (await res.json()) as {
    doc?: Parameters<typeof mapCommentDoc>[0]
  }
  if (!data.doc) {
    throw new Error('创建评论失败')
  }
  return mapCommentDoc(data.doc)
}
