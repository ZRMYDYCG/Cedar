import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_joys_status" AS ENUM('draft', 'published');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum__joys_v_version_status" AS ENUM('draft', 'published');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    CREATE TABLE IF NOT EXISTS "joys" (
      "id" serial PRIMARY KEY NOT NULL,
      "day" timestamp(3) with time zone,
      -- Payload field names item1/item2/item3 are NOT snake_cased (no capitals).
      "item1" varchar,
      "item2" varchar,
      "item3" varchar,
      "note" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "_status" "public"."enum_joys_status" DEFAULT 'draft'
    );

    CREATE TABLE IF NOT EXISTS "_joys_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_day" timestamp(3) with time zone,
      "version_item1" varchar,
      "version_item2" varchar,
      "version_item3" varchar,
      "version_note" varchar,
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "version__status" "public"."enum__joys_v_version_status" DEFAULT 'draft',
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "latest" boolean,
      "autosave" boolean
    );

    DO $$ BEGIN
      ALTER TABLE "_joys_v"
        ADD CONSTRAINT "_joys_v_parent_id_joys_id_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."joys"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE UNIQUE INDEX IF NOT EXISTS "joys_day_idx" ON "joys" USING btree ("day");
    CREATE INDEX IF NOT EXISTS "joys_updated_at_idx" ON "joys" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "joys_created_at_idx" ON "joys" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "joys__status_idx" ON "joys" USING btree ("_status");
    CREATE INDEX IF NOT EXISTS "_joys_v_parent_idx" ON "_joys_v" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "_joys_v_version_version_status_idx" ON "_joys_v" USING btree ("version__status");
    CREATE INDEX IF NOT EXISTS "_joys_v_updated_at_idx" ON "_joys_v" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "_joys_v_created_at_idx" ON "_joys_v" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "_joys_v_latest_idx" ON "_joys_v" USING btree ("latest");
    CREATE INDEX IF NOT EXISTS "_joys_v_autosave_idx" ON "_joys_v" USING btree ("autosave");

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "joys_id" integer;

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_joys_fk"
        FOREIGN KEY ("joys_id") REFERENCES "public"."joys"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_joys_id_idx"
      ON "payload_locked_documents_rels" USING btree ("joys_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_joys_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_joys_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "joys_id";
    DROP TABLE IF EXISTS "_joys_v" CASCADE;
    DROP TABLE IF EXISTS "joys" CASCADE;
    DROP TYPE IF EXISTS "public"."enum__joys_v_version_status";
    DROP TYPE IF EXISTS "public"."enum_joys_status";
  `)
}
