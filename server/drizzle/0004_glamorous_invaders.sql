CREATE TABLE "launch_note" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"company" text NOT NULL,
	"summary" text NOT NULL,
	"tags" text DEFAULT '[]' NOT NULL,
	"disclosure" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewed_by" text,
	"review_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallet" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"public_key" text NOT NULL,
	"encrypted_private_key" text NOT NULL,
	"iv" text NOT NULL,
	"auth_tag" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wallet_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "wallet_public_key_unique" UNIQUE("public_key")
);
--> statement-breakpoint
ALTER TABLE "creator_profile" ADD COLUMN "affiliation" text;--> statement-breakpoint
ALTER TABLE "creator_profile" ADD COLUMN "credentials" text;--> statement-breakpoint
ALTER TABLE "creator_profile" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "creator_profile" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "disclosure" text;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "next_billing_date" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_banned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "launch_note" ADD CONSTRAINT "launch_note_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "launch_note" ADD CONSTRAINT "launch_note_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;