ALTER TABLE "community_post_like" ADD CONSTRAINT "community_post_like_post_id_user_id_pk" PRIMARY KEY("post_id","user_id");--> statement-breakpoint
ALTER TABLE "community_post_tag" ADD CONSTRAINT "community_post_tag_post_id_tag_id_pk" PRIMARY KEY("post_id","tag_id");--> statement-breakpoint
ALTER TABLE "post_vote" ADD CONSTRAINT "post_vote_post_id_user_id_pk" PRIMARY KEY("post_id","user_id");