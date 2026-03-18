CREATE TABLE "creator_rating" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_profile_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"rating" integer NOT NULL,
	"feedback" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_user_rating_unique" UNIQUE("creator_profile_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "creator_profile" ADD COLUMN "subscription_price" text DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "is_pinned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "tx_signature" text;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "amount_usdc" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "anonymous_name" text;--> statement-breakpoint
ALTER TABLE "creator_rating" ADD CONSTRAINT "creator_rating_creator_profile_id_creator_profile_id_fk" FOREIGN KEY ("creator_profile_id") REFERENCES "public"."creator_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_rating" ADD CONSTRAINT "creator_rating_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;