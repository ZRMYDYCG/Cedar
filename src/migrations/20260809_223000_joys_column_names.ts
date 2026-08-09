import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/**
 * Payload field `item1` maps to DB column "item1" (no underscore — no camelCase break).
 * The first joys migration incorrectly created item_1 / version_item_1.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'joys' AND column_name = 'item_1'
      ) THEN
        ALTER TABLE "joys" RENAME COLUMN "item_1" TO "item1";
      END IF;
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'joys' AND column_name = 'item_2'
      ) THEN
        ALTER TABLE "joys" RENAME COLUMN "item_2" TO "item2";
      END IF;
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'joys' AND column_name = 'item_3'
      ) THEN
        ALTER TABLE "joys" RENAME COLUMN "item_3" TO "item3";
      END IF;

      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = '_joys_v' AND column_name = 'version_item_1'
      ) THEN
        ALTER TABLE "_joys_v" RENAME COLUMN "version_item_1" TO "version_item1";
      END IF;
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = '_joys_v' AND column_name = 'version_item_2'
      ) THEN
        ALTER TABLE "_joys_v" RENAME COLUMN "version_item_2" TO "version_item2";
      END IF;
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = '_joys_v' AND column_name = 'version_item_3'
      ) THEN
        ALTER TABLE "_joys_v" RENAME COLUMN "version_item_3" TO "version_item3";
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'joys' AND column_name = 'item1'
      ) THEN
        ALTER TABLE "joys" RENAME COLUMN "item1" TO "item_1";
      END IF;
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'joys' AND column_name = 'item2'
      ) THEN
        ALTER TABLE "joys" RENAME COLUMN "item2" TO "item_2";
      END IF;
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'joys' AND column_name = 'item3'
      ) THEN
        ALTER TABLE "joys" RENAME COLUMN "item3" TO "item_3";
      END IF;

      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = '_joys_v' AND column_name = 'version_item1'
      ) THEN
        ALTER TABLE "_joys_v" RENAME COLUMN "version_item1" TO "version_item_1";
      END IF;
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = '_joys_v' AND column_name = 'version_item2'
      ) THEN
        ALTER TABLE "_joys_v" RENAME COLUMN "version_item2" TO "version_item_2";
      END IF;
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = '_joys_v' AND column_name = 'version_item3'
      ) THEN
        ALTER TABLE "_joys_v" RENAME COLUMN "version_item3" TO "version_item_3";
      END IF;
    END $$;
  `)
}
