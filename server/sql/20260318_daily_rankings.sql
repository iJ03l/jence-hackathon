ALTER TABLE "launch_note"
	ADD COLUMN IF NOT EXISTS "logo_url" text;

CREATE TABLE IF NOT EXISTS "post_daily_view" (
	"post_id" uuid NOT NULL,
	"view_date" date DEFAULT CURRENT_DATE NOT NULL,
	"view_count" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "post_daily_view_post_id_view_date_pk" PRIMARY KEY("post_id","view_date")
);

DO $$ BEGIN
	ALTER TABLE "post_daily_view"
		ADD CONSTRAINT "post_daily_view_post_id_post_id_fk"
		FOREIGN KEY ("post_id") REFERENCES "public"."post"("id");
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "post_daily_view_view_date_post_id_idx"
	ON "post_daily_view" ("view_date", "post_id");

CREATE TABLE IF NOT EXISTS "community_post_daily_view" (
	"post_id" uuid NOT NULL,
	"view_date" date DEFAULT CURRENT_DATE NOT NULL,
	"view_count" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "community_post_daily_view_post_id_view_date_pk" PRIMARY KEY("post_id","view_date")
);

DO $$ BEGIN
	ALTER TABLE "community_post_daily_view"
		ADD CONSTRAINT "community_post_daily_view_post_id_community_post_id_fk"
		FOREIGN KEY ("post_id") REFERENCES "public"."community_post"("id");
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "community_post_daily_view_view_date_post_id_idx"
	ON "community_post_daily_view" ("view_date", "post_id");

CREATE TABLE IF NOT EXISTS "launch_note_daily_view" (
	"launch_note_id" uuid NOT NULL,
	"view_date" date DEFAULT CURRENT_DATE NOT NULL,
	"view_count" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "launch_note_daily_view_launch_note_id_view_date_pk" PRIMARY KEY("launch_note_id","view_date")
);

DO $$ BEGIN
	ALTER TABLE "launch_note_daily_view"
		ADD CONSTRAINT "launch_note_daily_view_launch_note_id_launch_note_id_fk"
		FOREIGN KEY ("launch_note_id") REFERENCES "public"."launch_note"("id");
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "launch_note_daily_view_view_date_launch_note_id_idx"
	ON "launch_note_daily_view" ("view_date", "launch_note_id");

CREATE TABLE IF NOT EXISTS "launch_note_upvote" (
	"launch_note_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "launch_note_upvote_launch_note_id_user_id_pk" PRIMARY KEY("launch_note_id","user_id")
);

DO $$ BEGIN
	ALTER TABLE "launch_note_upvote"
		ADD CONSTRAINT "launch_note_upvote_launch_note_id_launch_note_id_fk"
		FOREIGN KEY ("launch_note_id") REFERENCES "public"."launch_note"("id");
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
	ALTER TABLE "launch_note_upvote"
		ADD CONSTRAINT "launch_note_upvote_user_id_user_id_fk"
		FOREIGN KEY ("user_id") REFERENCES "public"."user"("id");
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;
