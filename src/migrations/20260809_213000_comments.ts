import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_comments_target_kind" AS ENUM('post', 'page', 'about', 'links');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    CREATE TABLE IF NOT EXISTS "comments" (
      "id" serial PRIMARY KEY NOT NULL,
      "target" varchar NOT NULL,
      "target_kind" "public"."enum_comments_target_kind" DEFAULT 'post' NOT NULL,
      "content" varchar NOT NULL,
      "author_name" varchar NOT NULL,
      "author_email" varchar,
      "author_url" varchar,
      "author_id" integer,
      "parent_id" integer,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    DO $$ BEGIN
      ALTER TABLE "comments"
        ADD CONSTRAINT "comments_author_id_users_id_fk"
        FOREIGN KEY ("author_id") REFERENCES "public"."users"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "comments"
        ADD CONSTRAINT "comments_parent_id_comments_id_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE INDEX IF NOT EXISTS "comments_target_idx" ON "comments" USING btree ("target");
    CREATE INDEX IF NOT EXISTS "comments_created_at_idx" ON "comments" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "comments_updated_at_idx" ON "comments" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "comments_author_idx" ON "comments" USING btree ("author_id");
    CREATE INDEX IF NOT EXISTS "comments_parent_idx" ON "comments" USING btree ("parent_id");

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "comments_id" integer;

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_comments_fk"
        FOREIGN KEY ("comments_id") REFERENCES "public"."comments"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_comments_id_idx"
      ON "payload_locked_documents_rels" USING btree ("comments_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_comments_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_comments_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "comments_id";
    DROP TABLE IF EXISTS "comments" CASCADE;
    DROP TYPE IF EXISTS "public"."enum_comments_target_kind";
  `)
}
