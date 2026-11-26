CREATE TYPE "public"."sub_society_focus" AS ENUM('media', 'graphics', 'coding', 'events');--> statement-breakpoint
CREATE TABLE "sub_societies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"focus" "sub_society_focus" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sub_societies_club_name_key" UNIQUE("club_id","name")
);
--> statement-breakpoint
ALTER TABLE "sub_societies" ADD CONSTRAINT "sub_societies_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sub_societies_club_idx" ON "sub_societies" USING btree ("club_id");