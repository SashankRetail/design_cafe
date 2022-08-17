-- CreateTable
CREATE TABLE "dc_cities" (
    "name" VARCHAR(512),
    "status" BOOLEAN,
    "odoo_id" VARCHAR(256),
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "id" SERIAL NOT NULL,

    CONSTRAINT "dc_cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dc_experiencecenters" (
    "centerid" SERIAL NOT NULL,
    "name" VARCHAR(512),
    "odoo_id" VARCHAR(256),
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "ectype" VARCHAR(512),

    CONSTRAINT "dc_experiencecenters_pkey" PRIMARY KEY ("centerid")
);

-- CreateTable
CREATE TABLE "dc_role" (
    "roleid" SERIAL NOT NULL,
    "role_name" VARCHAR(128),
    "status" BOOLEAN NOT NULL,
    "created_date" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "dc_role_pkey" PRIMARY KEY ("roleid")
);

-- CreateTable
CREATE TABLE "dc_department" (
    "departmentid" SERIAL NOT NULL,
    "name" VARCHAR(128),
    "status" BOOLEAN NOT NULL,
    "created_date" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "dc_department_pkey" PRIMARY KEY ("departmentid")
);

-- CreateTable
CREATE TABLE "dc_teams" (
    "name" VARCHAR(512),
    "teammailid" VARCHAR(512),
    "reportingmanager" VARCHAR(512),
    "teamlead" VARCHAR(512),
    "department" VARCHAR(512),
    "odoo_id" VARCHAR(256),
    "create_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "id" SERIAL NOT NULL,

    CONSTRAINT "dc_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dc_profile" (
    "profileid" SERIAL NOT NULL,
    "profile_name" VARCHAR(128),
    "status" BOOLEAN NOT NULL,
    "created_date" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "dc_profile_pkey" PRIMARY KEY ("profileid")
);

-- CreateTable
CREATE TABLE "dc_teams_city" (
    "id" SERIAL NOT NULL,
    "teamid" INTEGER,
    "cityid" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "dc_teams_city_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dc_teams_experiencecenters" (
    "id" SERIAL NOT NULL,
    "teamid" INTEGER,
    "centerid" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "dc_teams_experiencecenters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dc_login_history" (
    "id" SERIAL NOT NULL,
    "entity_id" INTEGER,
    "login_time" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "dc_login_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dc_users" (
    "userid" SERIAL NOT NULL,
    "roleid" INTEGER,
    "empid" VARCHAR(256),
    "departmentid" INTEGER,
    "salesforceimported" BOOLEAN,
    "firstname" VARCHAR(512),
    "lastname" VARCHAR(512),
    "middlename" VARCHAR(512),
    "username" VARCHAR(512),
    "phonenumber" VARCHAR(512),
    "designcafeemail" VARCHAR(512),
    "reportingmanager" VARCHAR(512),
    "salesforceuserid" VARCHAR(512),
    "isbetauser" BOOLEAN,
    "profilepic" VARCHAR(512),
    "lastlogindate" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "dc_users_pkey" PRIMARY KEY ("userid")
);

-- CreateTable
CREATE TABLE "dc_users_city" (
    "id" SERIAL NOT NULL,
    "userid" INTEGER,
    "cityid" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "dc_users_city_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dc_users_experiencecenters" (
    "id" SERIAL NOT NULL,
    "userid" INTEGER,
    "centerid" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "dc_users_experiencecenters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dc_users_team" (
    "id" SERIAL NOT NULL,
    "userid" INTEGER,
    "teamid" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "dc_users_team_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "dc_teams_city" ADD CONSTRAINT "dc_teams_city_cityid_fkey" FOREIGN KEY ("cityid") REFERENCES "dc_cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dc_teams_city" ADD CONSTRAINT "dc_teams_city_teamid_fkey" FOREIGN KEY ("teamid") REFERENCES "dc_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dc_teams_experiencecenters" ADD CONSTRAINT "dc_teams_experiencecenters_centerid_fkey" FOREIGN KEY ("centerid") REFERENCES "dc_experiencecenters"("centerid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dc_teams_experiencecenters" ADD CONSTRAINT "dc_teams_experiencecenters_teamid_fkey" FOREIGN KEY ("teamid") REFERENCES "dc_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dc_users" ADD CONSTRAINT "dc_users_roleid_fkey" FOREIGN KEY ("roleid") REFERENCES "dc_role"("roleid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dc_users" ADD CONSTRAINT "dc_users_departmentid_fkey" FOREIGN KEY ("departmentid") REFERENCES "dc_department"("departmentid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dc_users_city" ADD CONSTRAINT "dc_users_city_cityid_fkey" FOREIGN KEY ("cityid") REFERENCES "dc_cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dc_users_city" ADD CONSTRAINT "dc_users_city_userid_fkey" FOREIGN KEY ("userid") REFERENCES "dc_users"("userid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dc_users_experiencecenters" ADD CONSTRAINT "dc_users_experiencecenters_centerid_fkey" FOREIGN KEY ("centerid") REFERENCES "dc_experiencecenters"("centerid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dc_users_experiencecenters" ADD CONSTRAINT "dc_users_experiencecenters_userid_fkey" FOREIGN KEY ("userid") REFERENCES "dc_users"("userid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dc_users_team" ADD CONSTRAINT "dc_users_team_teamid_fkey" FOREIGN KEY ("teamid") REFERENCES "dc_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dc_users_team" ADD CONSTRAINT "dc_users_team_userid_fkey" FOREIGN KEY ("userid") REFERENCES "dc_users"("userid") ON DELETE SET NULL ON UPDATE CASCADE;
