-- Migration: Add data deletion requests table for RGPD compliance
-- Created: 2025-01-27

CREATE TABLE IF NOT EXISTS "data_deletion_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"user_email" text NOT NULL,
	"requested_at" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"reason" text,
	"admin_notes" text,
	"processed_at" text,
	"created_at" text DEFAULT CURRENT_TIMESTAMP,
	"updated_at" text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "data_deletion_requests_user_idx" ON "data_deletion_requests" ("user_id");
CREATE INDEX IF NOT EXISTS "data_deletion_requests_status_idx" ON "data_deletion_requests" ("status");
CREATE INDEX IF NOT EXISTS "data_deletion_requests_requested_at_idx" ON "data_deletion_requests" ("requested_at");
