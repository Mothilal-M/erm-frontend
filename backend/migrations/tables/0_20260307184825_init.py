from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS "t_user" (
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "status" BOOL NOT NULL DEFAULT True,
    "user_id" UUID NOT NULL PRIMARY KEY,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "fullname" VARCHAR(1000) NOT NULL DEFAULT '',
    "phone" VARCHAR(100) NOT NULL DEFAULT '',
    "token" VARCHAR(1000) NOT NULL DEFAULT '',
    "type" INT NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS "idx_t_user_email_6fe6a5" ON "t_user" ("email");
CREATE INDEX IF NOT EXISTS "idx_t_user_token_f70d89" ON "t_user" ("token");
COMMENT ON TABLE "t_user" IS 'UserTable model representing a user in the database.';
CREATE TABLE IF NOT EXISTS "t_user_devices" (
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "status" BOOL NOT NULL DEFAULT True,
    "id" SERIAL NOT NULL PRIMARY KEY,
    "device_name" VARCHAR(100) NOT NULL DEFAULT '',
    "device_id" VARCHAR(100) NOT NULL DEFAULT '',
    "location" VARCHAR(100) NOT NULL DEFAULT '',
    "user_id" UUID NOT NULL REFERENCES "t_user" ("user_id") ON DELETE CASCADE
);
COMMENT ON TABLE "t_user_devices" IS 'UserDeviceTable represents a table for storing user device information.';
CREATE TABLE IF NOT EXISTS "t_department" (
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "status" BOOL NOT NULL DEFAULT True,
    "id" SERIAL NOT NULL PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS "t_employee" (
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "status" BOOL NOT NULL DEFAULT True,
    "id" SERIAL NOT NULL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "phone" VARCHAR(50) NOT NULL DEFAULT '',
    "role" VARCHAR(20) NOT NULL DEFAULT 'employee',
    "join_date" DATE,
    "employee_status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "avatar" VARCHAR(500) NOT NULL DEFAULT '',
    "department_id" INT REFERENCES "t_department" ("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "idx_t_employee_email_d32844" ON "t_employee" ("email");
CREATE TABLE IF NOT EXISTS "t_attendance_log" (
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "status" BOOL NOT NULL DEFAULT True,
    "id" SERIAL NOT NULL PRIMARY KEY,
    "date" DATE NOT NULL,
    "clock_in" TIMESTAMPTZ NOT NULL,
    "clock_out" TIMESTAMPTZ,
    "duration_minutes" INT,
    "work_summary" TEXT,
    "attendance_status" VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    "is_manual_entry" BOOL NOT NULL DEFAULT False,
    "manual_entry_reason" TEXT,
    "is_flagged" BOOL NOT NULL DEFAULT False,
    "flag_reason" TEXT,
    "flagged_by" VARCHAR(255),
    "flagged_at" TIMESTAMPTZ,
    "edited_by" VARCHAR(255),
    "edited_at" TIMESTAMPTZ,
    "edit_reason" TEXT,
    "note" TEXT,
    "employee_id" INT NOT NULL REFERENCES "t_employee" ("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "idx_t_attendanc_date_d74f5c" ON "t_attendance_log" ("date");
CREATE TABLE IF NOT EXISTS "t_leave_settings" (
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "status" BOOL NOT NULL DEFAULT True,
    "id" SERIAL NOT NULL PRIMARY KEY,
    "annual_leave_quota" INT NOT NULL DEFAULT 20,
    "sick_leave_quota" INT NOT NULL DEFAULT 10,
    "casual_leave_quota" INT NOT NULL DEFAULT 5,
    "carry_forward_limit" INT NOT NULL DEFAULT 5,
    "carry_forward_enabled" BOOL NOT NULL DEFAULT True,
    "half_day_enabled" BOOL NOT NULL DEFAULT True,
    "wfh_enabled" BOOL NOT NULL DEFAULT True,
    "auto_approve_after_days" INT,
    "blackout_dates" JSONB NOT NULL,
    "leave_year_start" VARCHAR(5) NOT NULL DEFAULT '01-01'
);
CREATE TABLE IF NOT EXISTS "t_leave_type" (
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "status" BOOL NOT NULL DEFAULT True,
    "id" SERIAL NOT NULL PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL UNIQUE,
    "color" VARCHAR(20) NOT NULL DEFAULT 'blue'
);
CREATE TABLE IF NOT EXISTS "t_leave_balance" (
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "status" BOOL NOT NULL DEFAULT True,
    "id" SERIAL NOT NULL PRIMARY KEY,
    "year" INT NOT NULL,
    "allocated" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "used" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pending" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "employee_id" INT NOT NULL REFERENCES "t_employee" ("id") ON DELETE CASCADE,
    "leave_type_id" INT NOT NULL REFERENCES "t_leave_type" ("id") ON DELETE CASCADE,
    CONSTRAINT "uid_t_leave_bal_employe_7a244d" UNIQUE ("employee_id", "leave_type_id", "year")
);
CREATE TABLE IF NOT EXISTS "t_leave_request" (
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "status" BOOL NOT NULL DEFAULT True,
    "id" SERIAL NOT NULL PRIMARY KEY,
    "sub_type" VARCHAR(20) NOT NULL DEFAULT 'full',
    "date_from" DATE NOT NULL,
    "date_to" DATE NOT NULL,
    "days" DOUBLE PRECISION NOT NULL,
    "leave_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "reason" TEXT,
    "applied_on" DATE NOT NULL,
    "review_note" TEXT,
    "reviewed_at" TIMESTAMPTZ,
    "employee_id" INT NOT NULL REFERENCES "t_employee" ("id") ON DELETE CASCADE,
    "leave_type_id" INT NOT NULL REFERENCES "t_leave_type" ("id") ON DELETE CASCADE,
    "reviewed_by_id" INT REFERENCES "t_employee" ("id") ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS "aerich" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "version" VARCHAR(255) NOT NULL,
    "app" VARCHAR(100) NOT NULL,
    "content" JSONB NOT NULL
);"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        """
