ALTER TABLE "post" ADD COLUMN "allow_tips" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "launch_note" ADD COLUMN "allow_tips" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE TABLE "tip" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipper_user_id" text NOT NULL,
	"recipient_user_id" text NOT NULL,
	"target_type" text NOT NULL,
	"creator_profile_id" uuid,
	"post_id" uuid,
	"launch_note_id" uuid,
	"amount_usdc" text NOT NULL,
	"tx_signature" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tip" ADD CONSTRAINT "tip_tipper_user_id_user_id_fk" FOREIGN KEY ("tipper_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tip" ADD CONSTRAINT "tip_recipient_user_id_user_id_fk" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tip" ADD CONSTRAINT "tip_creator_profile_id_creator_profile_id_fk" FOREIGN KEY ("creator_profile_id") REFERENCES "public"."creator_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tip" ADD CONSTRAINT "tip_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tip" ADD CONSTRAINT "tip_launch_note_id_launch_note_id_fk" FOREIGN KEY ("launch_note_id") REFERENCES "public"."launch_note"("id") ON DELETE no action ON UPDATE no action;
