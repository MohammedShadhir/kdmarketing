


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."ensure_single_default_ghl_account"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE ghl_accounts
    SET is_default = false
    WHERE id != NEW.id AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."ensure_single_default_ghl_account"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_ghl_accounts_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_ghl_accounts_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."geofences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "center_lat" double precision NOT NULL,
    "center_lng" double precision NOT NULL,
    "radius_meters" integer DEFAULT 500 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."geofences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ghl_accounts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "account_name" "text" NOT NULL,
    "location_id" "text" NOT NULL,
    "api_token" "text" NOT NULL,
    "calendar_id" "text",
    "pipeline_id" "text",
    "is_active" boolean DEFAULT true,
    "is_default" boolean DEFAULT false,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ghl_accounts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."location_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subcontractor_id" "uuid" NOT NULL,
    "latitude" double precision NOT NULL,
    "longitude" double precision NOT NULL,
    "accuracy" double precision,
    "recorded_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."location_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "subcontractor_id" "uuid",
    "project_id" "uuid",
    "geofence_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "is_read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "notifications_type_check" CHECK (("type" = ANY (ARRAY['geofence_exit'::"text", 'geofence_enter'::"text", 'offline_alert'::"text"])))
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_media" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_url" "text" NOT NULL,
    "file_type" "text",
    "file_size" bigint,
    "uploaded_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."project_media" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subcontractor_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "project_price" numeric NOT NULL,
    "subcontractor_percentage" numeric NOT NULL,
    "sales_commission_percentage" numeric NOT NULL,
    "sales_person" "text",
    "advance_payment_amount" numeric DEFAULT 0,
    "mode_of_payment" "text",
    "start_date" "date",
    "end_date" "date",
    "notes" "text",
    "status" "text" DEFAULT 'Active'::"text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "refund_amount" numeric(10,2) DEFAULT 0,
    "refund_date" "date",
    "is_discontinued" boolean DEFAULT false,
    "visibility" "text" DEFAULT 'public'::"text",
    "customer_name" "text",
    "customer_id" "text",
    "address_line1" "text",
    "address_line2" "text",
    "city" "text",
    "state" "text",
    "zipcode" "text",
    "default_tax_percentage" numeric DEFAULT 0,
    "payments" "jsonb" DEFAULT '[]'::"jsonb",
    "total_payments_received" numeric DEFAULT 0,
    "total_tax_collected" numeric DEFAULT 0,
    "remaining_balance" numeric DEFAULT 0,
    "advance_payment_tax_percentage" numeric DEFAULT 0,
    "advance_payment_tax_amount" numeric DEFAULT 0,
    "media_files" "jsonb" DEFAULT '[]'::"jsonb",
    "review_collected" boolean DEFAULT false,
    CONSTRAINT "projects_visibility_check" CHECK (("visibility" = ANY (ARRAY['public'::"text", 'unlisted'::"text", 'private'::"text"])))
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


COMMENT ON COLUMN "public"."projects"."refund_amount" IS 'Amount refunded to the client when project is discontinued';



COMMENT ON COLUMN "public"."projects"."refund_date" IS 'Date when the refund was issued';



COMMENT ON COLUMN "public"."projects"."is_discontinued" IS 'Flag indicating if the project has been discontinued';



COMMENT ON COLUMN "public"."projects"."visibility" IS 'Project visibility: public (full details), unlisted (only dates), private (hidden)';



COMMENT ON COLUMN "public"."projects"."media_files" IS 'Array of media file objects with structure: [{id: string, name: string, url: string, type: string, size: number, uploadedAt: string}]';



CREATE TABLE IF NOT EXISTS "public"."sales_subcontractor_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sales_user_id" "uuid" NOT NULL,
    "subcontractor_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sales_subcontractor_assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subcontractors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "company_name" "text",
    "default_subcontractor_percentage" numeric DEFAULT 70,
    "default_sales_percentage" numeric DEFAULT 15,
    "address" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "password_hash" "text",
    "is_active" boolean DEFAULT true,
    "last_login" timestamp with time zone,
    "profile_picture_url" "text",
    "last_known_lat" double precision,
    "last_known_lng" double precision,
    "last_seen_at" timestamp with time zone
);


ALTER TABLE "public"."subcontractors" OWNER TO "postgres";


COMMENT ON COLUMN "public"."subcontractors"."password_hash" IS 'Bcrypt hashed password for sub-contractor login';



COMMENT ON COLUMN "public"."subcontractors"."is_active" IS 'Whether the sub-contractor account is active and can login';



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "password_hash" "text" NOT NULL,
    "name" "text" NOT NULL,
    "role" "text" DEFAULT 'sales'::"text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "profile_picture_url" "text",
    "last_login" timestamp with time zone,
    "default_sales_commission" numeric DEFAULT 15,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "users_role_check" CHECK (("role" = ANY (ARRAY['sales'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON TABLE "public"."users" IS 'Sales and admin user accounts with password authentication';



COMMENT ON COLUMN "public"."users"."default_sales_commission" IS 'Default sales commission percentage for this salesperson. Used when creating projects.';



ALTER TABLE ONLY "public"."geofences"
    ADD CONSTRAINT "geofences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ghl_accounts"
    ADD CONSTRAINT "ghl_accounts_location_id_key" UNIQUE ("location_id");



ALTER TABLE ONLY "public"."ghl_accounts"
    ADD CONSTRAINT "ghl_accounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."location_logs"
    ADD CONSTRAINT "location_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_media"
    ADD CONSTRAINT "project_media_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sales_subcontractor_assignments"
    ADD CONSTRAINT "sales_subcontractor_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subcontractors"
    ADD CONSTRAINT "subcontractors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_geofences_active" ON "public"."geofences" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_geofences_project_id" ON "public"."geofences" USING "btree" ("project_id");



CREATE INDEX "idx_ghl_accounts_is_active" ON "public"."ghl_accounts" USING "btree" ("is_active");



CREATE INDEX "idx_ghl_accounts_location_id" ON "public"."ghl_accounts" USING "btree" ("location_id");



CREATE INDEX "idx_location_logs_recorded_at" ON "public"."location_logs" USING "btree" ("recorded_at" DESC);



CREATE INDEX "idx_location_logs_subcontractor_date" ON "public"."location_logs" USING "btree" ("subcontractor_id", "recorded_at" DESC);



CREATE INDEX "idx_notifications_created_at" ON "public"."notifications" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_notifications_subcontractor_id" ON "public"."notifications" USING "btree" ("subcontractor_id");



CREATE INDEX "idx_notifications_unread" ON "public"."notifications" USING "btree" ("is_read") WHERE ("is_read" = false);



CREATE INDEX "idx_project_media_project_id" ON "public"."project_media" USING "btree" ("project_id");



CREATE INDEX "idx_projects_end_date" ON "public"."projects" USING "btree" ("end_date");



CREATE INDEX "idx_projects_start_date" ON "public"."projects" USING "btree" ("start_date");



CREATE INDEX "idx_projects_status" ON "public"."projects" USING "btree" ("status");



CREATE INDEX "idx_projects_subcontractor_id" ON "public"."projects" USING "btree" ("subcontractor_id");



CREATE INDEX "idx_projects_visibility" ON "public"."projects" USING "btree" ("visibility");



CREATE INDEX "idx_sales_assignments_subcontractor" ON "public"."sales_subcontractor_assignments" USING "btree" ("subcontractor_id");



CREATE INDEX "idx_sales_assignments_user" ON "public"."sales_subcontractor_assignments" USING "btree" ("sales_user_id");



CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email");



CREATE INDEX "idx_users_role" ON "public"."users" USING "btree" ("role");



CREATE OR REPLACE TRIGGER "set_updated_at_geofences" BEFORE UPDATE ON "public"."geofences" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at_projects" BEFORE UPDATE ON "public"."projects" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at_subcontractors" BEFORE UPDATE ON "public"."subcontractors" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_ensure_single_default_ghl_account" BEFORE INSERT OR UPDATE ON "public"."ghl_accounts" FOR EACH ROW WHEN (("new"."is_default" = true)) EXECUTE FUNCTION "public"."ensure_single_default_ghl_account"();



CREATE OR REPLACE TRIGGER "trigger_update_ghl_accounts_updated_at" BEFORE UPDATE ON "public"."ghl_accounts" FOR EACH ROW EXECUTE FUNCTION "public"."update_ghl_accounts_updated_at"();



ALTER TABLE ONLY "public"."geofences"
    ADD CONSTRAINT "geofences_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."location_logs"
    ADD CONSTRAINT "location_logs_subcontractor_id_fkey" FOREIGN KEY ("subcontractor_id") REFERENCES "public"."subcontractors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_geofence_id_fkey" FOREIGN KEY ("geofence_id") REFERENCES "public"."geofences"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_subcontractor_id_fkey" FOREIGN KEY ("subcontractor_id") REFERENCES "public"."subcontractors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_media"
    ADD CONSTRAINT "project_media_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_subcontractor_id_fkey" FOREIGN KEY ("subcontractor_id") REFERENCES "public"."subcontractors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sales_subcontractor_assignments"
    ADD CONSTRAINT "sales_subcontractor_assignments_sales_user_id_fkey" FOREIGN KEY ("sales_user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sales_subcontractor_assignments"
    ADD CONSTRAINT "sales_subcontractor_assignments_subcontractor_id_fkey" FOREIGN KEY ("subcontractor_id") REFERENCES "public"."subcontractors"("id") ON DELETE CASCADE;



CREATE POLICY "Allow all operations on assignments" ON "public"."sales_subcontractor_assignments" USING (true) WITH CHECK (true);



CREATE POLICY "Allow all operations on geofences" ON "public"."geofences" USING (true) WITH CHECK (true);



CREATE POLICY "Allow all operations on ghl_accounts" ON "public"."ghl_accounts" USING (true) WITH CHECK (true);



CREATE POLICY "Allow all operations on location_logs" ON "public"."location_logs" USING (true) WITH CHECK (true);



CREATE POLICY "Allow all operations on notifications" ON "public"."notifications" USING (true) WITH CHECK (true);



CREATE POLICY "Allow all operations on project_media" ON "public"."project_media" USING (true) WITH CHECK (true);



CREATE POLICY "Allow all operations on users" ON "public"."users" USING (true) WITH CHECK (true);



CREATE POLICY "Enable delete for authenticated users only" ON "public"."projects" FOR DELETE USING (true);



CREATE POLICY "Enable delete for authenticated users only" ON "public"."subcontractors" FOR DELETE USING (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."projects" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."subcontractors" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."projects" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."subcontractors" FOR SELECT USING (true);



CREATE POLICY "Enable update for authenticated users only" ON "public"."projects" FOR UPDATE USING (true);



CREATE POLICY "Enable update for authenticated users only" ON "public"."subcontractors" FOR UPDATE USING (true);



ALTER TABLE "public"."geofences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ghl_accounts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."location_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."project_media" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sales_subcontractor_assignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subcontractors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."ensure_single_default_ghl_account"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_single_default_ghl_account"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_single_default_ghl_account"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_ghl_accounts_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_ghl_accounts_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_ghl_accounts_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."geofences" TO "anon";
GRANT ALL ON TABLE "public"."geofences" TO "authenticated";
GRANT ALL ON TABLE "public"."geofences" TO "service_role";



GRANT ALL ON TABLE "public"."ghl_accounts" TO "anon";
GRANT ALL ON TABLE "public"."ghl_accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."ghl_accounts" TO "service_role";



GRANT ALL ON TABLE "public"."location_logs" TO "anon";
GRANT ALL ON TABLE "public"."location_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."location_logs" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."project_media" TO "anon";
GRANT ALL ON TABLE "public"."project_media" TO "authenticated";
GRANT ALL ON TABLE "public"."project_media" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";



GRANT ALL ON TABLE "public"."sales_subcontractor_assignments" TO "anon";
GRANT ALL ON TABLE "public"."sales_subcontractor_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."sales_subcontractor_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."subcontractors" TO "anon";
GRANT ALL ON TABLE "public"."subcontractors" TO "authenticated";
GRANT ALL ON TABLE "public"."subcontractors" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































