import 'server-only'

import {
  mapCommentDoc,
  type CommentCard
} from '@/data/cms/comments-shared'
import { safeCms } from '@/data/cms/safe'
import { getPayloadClient } from '@/lib/payload'
import type { Comment } from '@/payload-types'

export type {
  CommentCard,
  CommentTargetKind,
  CreateCommentInput
} from '@/data/cms/comments-shared'

export {
  commentHref,
  createComment,
  groupComments,
  mapCommentDoc
} from '@/data/cms/comments-shared'

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
      return (result.docs as Comment[]).map(mapCommentDoc)
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
      return (result.docs as Comment[]).map(mapCommentDoc)
    },
    []
  )
}
