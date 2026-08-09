/**
 * Repair DB↔Gitee filename mismatches from the old double-random rename bug.
 *
 * Usage (from repo root, with GITEE_* in .env):
 *   node --env-file=.env scripts/repair-gitee-media.mjs
 *   SITE_URL=https://vlog.versakit.online node --env-file=.env scripts/repair-gitee-media.mjs
 */
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

function loadDotEnv() {
  const envPath = resolve(process.cwd(), '.env')
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = value
  }
}

loadDotEnv()

const owner = process.env.GITEE_OWNER?.trim()
const repo = process.env.GITEE_REPO?.trim()
const token = process.env.GITEE_TOKEN?.trim()
const branch = process.env.GITEE_BRANCH?.trim() || 'master'
const siteUrl = (process.env.SITE_URL || 'https://vlog.versakit.online').replace(
  /\/$/,
  ''
)

if (!owner || !repo || !token) {
  console.error('Missing GITEE_OWNER / GITEE_REPO / GITEE_TOKEN')
  process.exit(1)
}

async function giteeJson(url, init) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      'User-Agent': 'cedar-repair-gitee-media',
      ...(init?.headers || {})
    }
  })
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  if (!res.ok) {
    throw new Error(`${res.status} ${url}: ${typeof data === 'string' ? data : JSON.stringify(data)}`)
  }
  return data
}

async function listMediaDocs() {
  const docs = []
  let page = 1
  for (;;) {
    const data = await giteeJson(
      `${siteUrl}/api/media?limit=100&page=${page}&depth=0&sort=-createdAt`
    )
    docs.push(...(data.docs || []))
    if (!data.hasNextPage) break
    page += 1
  }
  return docs
}

async function listGiteeNames() {
  const data = await giteeJson(
    `https://gitee.com/api/v5/repos/${owner}/${repo}/contents/media?access_token=${token}&ref=${branch}`
  )
  if (!Array.isArray(data)) {
    throw new Error(`Unexpected Gitee listing: ${JSON.stringify(data).slice(0, 200)}`)
  }
  return new Set(data.filter((x) => x.type === 'file').map((x) => x.name))
}

async function fetchRaw(pathInRepo) {
  const url = `https://gitee.com/api/v5/repos/${owner}/${repo}/raw/${pathInRepo}?access_token=${token}&ref=${branch}`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'cedar-repair-gitee-media' }
  })
  if (!res.ok) {
    throw new Error(`raw ${res.status} ${pathInRepo}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

async function putFile(pathInRepo, buffer, message) {
  const content = buffer.toString('base64')
  const url = `https://gitee.com/api/v5/repos/${owner}/${repo}/contents/${pathInRepo}`
  const body = {
    access_token: token,
    content,
    message,
    branch
  }
  const created = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'cedar-repair-gitee-media'
    },
    body: JSON.stringify(body)
  })
  if (created.ok) return
  const meta = await giteeJson(
    `${url}?access_token=${token}&ref=${branch}`
  )
  const updated = await fetch(url, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'cedar-repair-gitee-media'
    },
    body: JSON.stringify({ ...body, sha: meta.sha })
  })
  if (!updated.ok) {
    throw new Error(`put failed ${updated.status} ${await updated.text()}`)
  }
}

function findOrphanCandidate(dbName, giteeNames) {
  if (giteeNames.has(dbName)) return null
  const dot = dbName.lastIndexOf('.')
  const stem = dot >= 0 ? dbName.slice(0, dot) : dbName
  const ext = dot >= 0 ? dbName.slice(dot) : ''
  const candidates = [...giteeNames].filter(
    (name) => name.startsWith(`${stem}-`) && name.endsWith(ext)
  )
  if (candidates.length === 0) return null
  // Longest stem match = most renames stacked (…-a-b.webp)
  candidates.sort((a, b) => b.length - a.length)
  return candidates[0]
}

const docs = await listMediaDocs()
const giteeNames = await listGiteeNames()
let repaired = 0
let ok = 0
let missing = 0

for (const doc of docs) {
  const filename = doc.filename
  if (!filename) continue
  if (giteeNames.has(filename)) {
    ok += 1
    continue
  }
  const candidate = findOrphanCandidate(filename, giteeNames)
  if (!candidate) {
    missing += 1
    console.warn(`MISSING id=${doc.id} db=${filename} (no gitee candidate)`)
    continue
  }
  console.log(`REPAIR id=${doc.id} ${candidate} -> ${filename}`)
  const buf = await fetchRaw(`media/${candidate}`)
  await putFile(
    `media/${filename}`,
    buf,
    `repair: sync ${candidate} -> ${filename} (media ${doc.id})`
  )
  giteeNames.add(filename)
  repaired += 1
}

console.log(
  JSON.stringify({ siteUrl, total: docs.length, ok, repaired, missing }, null, 2)
)
