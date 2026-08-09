import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "site_settings" (
      "id" serial PRIMARY KEY NOT NULL,
      "author" varchar,
      "nick" varchar,
      "subtitle" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
  `)

  // Seed one row from previous hard-coded defaults so Admin/front are non-empty.
  await db.execute(sql`
    INSERT INTO "site_settings" ("id", "author", "nick", "subtitle")
    SELECT 1, 'Cedar', 'Cedar', 'Notes under the cedar'
    WHERE NOT EXISTS (SELECT 1 FROM "site_settings" LIMIT 1);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "site_settings" CASCADE;
  `)
}
