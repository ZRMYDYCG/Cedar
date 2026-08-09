import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_moments_status" AS ENUM('draft', 'published');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum__moments_v_version_status" AS ENUM('draft', 'published');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    CREATE TABLE IF NOT EXISTS "moments" (
      "id" serial PRIMARY KEY NOT NULL,
      "content" varchar,
      "location" varchar,
      "published_at" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "_status" "public"."enum_moments_status" DEFAULT 'draft'
    );

    CREATE TABLE IF NOT EXISTS "moments_images" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "image_id" integer
    );

    CREATE TABLE IF NOT EXISTS "_moments_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_content" varchar,
      "version_location" varchar,
      "version_published_at" timestamp(3) with time zone,
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "version__status" "public"."enum__moments_v_version_status" DEFAULT 'draft',
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "latest" boolean,
      "autosave" boolean
    );

    CREATE TABLE IF NOT EXISTS "_moments_v_version_images" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "image_id" integer,
      "_uuid" varchar
    );

    DO $$ BEGIN
      ALTER TABLE "moments_images"
        ADD CONSTRAINT "moments_images_image_id_media_id_fk"
        FOREIGN KEY ("image_id") REFERENCES "public"."media"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "moments_images"
        ADD CONSTRAINT "moments_images_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."moments"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "_moments_v"
        ADD CONSTRAINT "_moments_v_parent_id_moments_id_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."moments"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "_moments_v_version_images"
        ADD CONSTRAINT "_moments_v_version_images_image_id_media_id_fk"
        FOREIGN KEY ("image_id") REFERENCES "public"."media"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "_moments_v_version_images"
        ADD CONSTRAINT "_moments_v_version_images_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."_moments_v"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE INDEX IF NOT EXISTS "moments_created_at_idx" ON "moments" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "moments_updated_at_idx" ON "moments" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "moments_published_at_idx" ON "moments" USING btree ("published_at");
    CREATE INDEX IF NOT EXISTS "moments__status_idx" ON "moments" USING btree ("_status");
    CREATE INDEX IF NOT EXISTS "moments_images_order_idx" ON "moments_images" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "moments_images_parent_id_idx" ON "moments_images" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "moments_images_image_idx" ON "moments_images" USING btree ("image_id");
    CREATE INDEX IF NOT EXISTS "_moments_v_parent_idx" ON "_moments_v" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "_moments_v_version_version_status_idx" ON "_moments_v" USING btree ("version__status");
    CREATE INDEX IF NOT EXISTS "_moments_v_created_at_idx" ON "_moments_v" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "_moments_v_updated_at_idx" ON "_moments_v" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "_moments_v_latest_idx" ON "_moments_v" USING btree ("latest");
    CREATE INDEX IF NOT EXISTS "_moments_v_autosave_idx" ON "_moments_v" USING btree ("autosave");
    CREATE INDEX IF NOT EXISTS "_moments_v_version_images_order_idx" ON "_moments_v_version_images" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_moments_v_version_images_parent_id_idx" ON "_moments_v_version_images" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_moments_v_version_images_image_idx" ON "_moments_v_version_images" USING btree ("image_id");

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "moments_id" integer;

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_moments_fk"
        FOREIGN KEY ("moments_id") REFERENCES "public"."moments"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_moments_id_idx"
      ON "payload_locked_documents_rels" USING btree ("moments_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "_moments_v_version_images" CASCADE;
    DROP TABLE IF EXISTS "_moments_v" CASCADE;
    DROP TABLE IF EXISTS "moments_images" CASCADE;
    DROP TABLE IF EXISTS "moments" CASCADE;
    DROP TYPE IF EXISTS "public"."enum__moments_v_version_status";
    DROP TYPE IF EXISTS "public"."enum_moments_status";
  `)
}
