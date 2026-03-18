ALTER TABLE "user" ADD COLUMN "onboarding_verticals" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "vertical" ADD COLUMN "tags" jsonb DEFAULT '[]'::jsonb NOT NULL;