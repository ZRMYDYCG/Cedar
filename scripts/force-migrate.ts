/**
 * CI-safe migrate:
 * Production DBs often contain a payload_migrations row with batch=-1 from
 * earlier "dev push". Payload then prompts; under CI that prompt auto-declines
 * and exits 0 without applying pending migrations (joys table never created).
 *
 * Clear those sentinel rows, then run migrate with no interactive gate.
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
  console.log(`[force-migrate] removed sentinel id=${doc.id} name=${doc.name}`)
}

if (typeof payload.db.migrate !== 'function') {
  throw new Error('Database adapter does not expose migrate()')
}

await payload.db.migrate()
console.log('[force-migrate] complete')
process.exit(0)
