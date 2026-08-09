/**
 * CI-safe migrate for Vercel builds.
 *
 * Clears payload_migrations batch=-1 (dev push sentinel) that otherwise makes
 * Payload's migrate prompt auto-decline under CI=true, then runs migrate().
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })

const dirty = await payload.find({
  collection: 'payload-migrations',
  where: { batch: { equals: -1 } },
  limit: 100,
  depth: 0,
  overrideAccess: true
})

console.log(`[force-migrate] found ${dirty.totalDocs} batch=-1 row(s)`)

for (const doc of dirty.docs) {
  await payload.delete({
    collection: 'payload-migrations',
    id: doc.id,
    overrideAccess: true
  })
  console.log(
    `[force-migrate] removed sentinel id=${doc.id} name=${doc.name}`
  )
}

if (typeof payload.db.migrate !== 'function') {
  throw new Error('Database adapter does not expose migrate()')
}

await payload.db.migrate()

try {
  const joys = await payload.find({
    collection: 'joys',
    limit: 1,
    depth: 0,
    overrideAccess: true
  })
  console.log(`[force-migrate] joys OK (totalDocs=${joys.totalDocs})`)
} catch (err) {
  const message = err instanceof Error ? err.message : String(err)
  console.error(`[force-migrate] joys still broken: ${message}`)
  process.exit(1)
}

console.log('[force-migrate] complete')
process.exit(0)
