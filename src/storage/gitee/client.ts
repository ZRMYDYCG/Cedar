import { MAX_UPLOAD_BYTES } from './constants'

export type GiteeConfig = {
  owner: string
  repo: string
  token: string
  branch: string
}

export class GiteeStorageError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message)
    this.name = 'GiteeStorageError'
  }
}

export function getGiteeConfig(): GiteeConfig | null {
  const owner = process.env.GITEE_OWNER?.trim()
  const repo = process.env.GITEE_REPO?.trim()
  const token = process.env.GITEE_TOKEN?.trim()
  const branch = process.env.GITEE_BRANCH?.trim() || 'master'

  if (!owner || !repo || !token) {
    return null
  }

  return { owner, repo, token, branch }
}

function encodeRepoPath(filePath: string): string {
  return filePath
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

function contentsUrl(config: GiteeConfig, filePath: string): string {
  return `https://gitee.com/api/v5/repos/${config.owner}/${config.repo}/contents/${encodeRepoPath(filePath)}`
}

function rawUrl(config: GiteeConfig, filePath: string): string {
  const url = new URL(
    `https://gitee.com/api/v5/repos/${config.owner}/${config.repo}/raw/${encodeRepoPath(filePath)}`
  )
  url.searchParams.set('access_token', config.token)
  url.searchParams.set('ref', config.branch)
  return url.toString()
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string; error?: string }
    return data.message || data.error || response.statusText
  } catch {
    return response.statusText || `HTTP ${response.status}`
  }
}

export async function uploadGiteeFile({
  config,
  filePath,
  buffer,
  message
}: {
  config: GiteeConfig
  filePath: string
  buffer: Buffer
  message: string
}): Promise<void> {
  if (buffer.byteLength > MAX_UPLOAD_BYTES) {
    throw new GiteeStorageError(
      `File exceeds ${MAX_UPLOAD_BYTES} byte limit for Gitee Contents API`
    )
  }

  const content = buffer.toString('base64')
  const existing = await getGiteeFileMeta({ config, filePath })

  const response = await fetch(contentsUrl(config, filePath), {
    method: existing?.sha ? 'PUT' : 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      access_token: config.token,
      content,
      message,
      branch: config.branch,
      ...(existing?.sha ? { sha: existing.sha } : {})
    })
  })

  if (!response.ok) {
    throw new GiteeStorageError(await readErrorMessage(response), response.status)
  }
}

type GiteeContentMeta = {
  sha?: string
  type?: string
}

export async function getGiteeFileMeta({
  config,
  filePath
}: {
  config: GiteeConfig
  filePath: string
}): Promise<GiteeContentMeta | null> {
  const url = new URL(contentsUrl(config, filePath))
  url.searchParams.set('access_token', config.token)
  url.searchParams.set('ref', config.branch)

  const response = await fetch(url, {
    headers: { Accept: 'application/json' }
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new GiteeStorageError(await readErrorMessage(response), response.status)
  }

  return (await response.json()) as GiteeContentMeta
}

export async function deleteGiteeFile({
  config,
  filePath,
  message
}: {
  config: GiteeConfig
  filePath: string
  message: string
}): Promise<void> {
  const meta = await getGiteeFileMeta({ config, filePath })
  if (!meta?.sha) {
    return
  }

  const response = await fetch(contentsUrl(config, filePath), {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      access_token: config.token,
      sha: meta.sha,
      message,
      branch: config.branch
    })
  })

  if (!response.ok && response.status !== 404) {
    throw new GiteeStorageError(await readErrorMessage(response), response.status)
  }
}

export async function fetchGiteeRaw({
  config,
  filePath
}: {
  config: GiteeConfig
  filePath: string
}): Promise<Response> {
  return fetch(rawUrl(config, filePath), {
    headers: {
      Accept: '*/*',
      'User-Agent': 'aurora-web-gitee-storage'
    }
  })
}

export { MAX_UPLOAD_BYTES } from './constants'
