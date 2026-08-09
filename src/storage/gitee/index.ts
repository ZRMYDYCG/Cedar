import type { Plugin } from 'payload'
import type { CollectionOptions } from '@payloadcms/plugin-cloud-storage/types'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'

import { createGiteeAdapter } from './adapter'
import { getGiteeConfig } from './client'

export type GiteeStorageOptions = {
  /**
   * Collection slugs to enable. Pass `true` or options (without adapter).
   */
  collections: Record<string, true | Omit<CollectionOptions, 'adapter'>>
  /**
   * Explicit enable flag. Defaults to true when Gitee env vars are present.
   */
  enabled?: boolean
  cacheControlMaxAge?: number
}

export { MAX_UPLOAD_BYTES } from './constants'
export { getGiteeConfig } from './client'

export const giteeStorage =
  (options: GiteeStorageOptions): Plugin =>
  (incomingConfig) => {
    const config = getGiteeConfig()
    const enabled =
      options.enabled !== undefined ? options.enabled : Boolean(config)

    if (!enabled || !config) {
      return incomingConfig
    }

    const adapter = createGiteeAdapter({
      config,
      cacheControlMaxAge: options.cacheControlMaxAge
    })

    const collectionsWithAdapter = Object.entries(options.collections).reduce(
      (acc, [slug, collOptions]) => {
        acc[slug] = {
          ...(collOptions === true ? {} : collOptions),
          adapter
        }
        return acc
      },
      {} as Record<string, CollectionOptions>
    )

    const withLocalDisabled = {
      ...incomingConfig,
      collections: (incomingConfig.collections || []).map((collection) => {
        if (!collectionsWithAdapter[collection.slug]) {
          return collection
        }

        return {
          ...collection,
          upload: {
            ...(typeof collection.upload === 'object' ? collection.upload : {}),
            disableLocalStorage: true
          }
        }
      })
    }

    return cloudStoragePlugin({
      collections: collectionsWithAdapter
    })(withLocalDisabled)
  }
