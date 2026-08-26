CREATE TABLE "league_renewal_member_roles" (
    "renewal_member_role_id" TEXT NOT NULL,
    "league_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'player',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "league_renewal_member_roles_pkey" PRIMARY KEY ("renewal_member_role_id")
);

CREATE UNIQUE INDEX "league_renewal_member_roles_league_id_user_id_key"
ON "league_renewal_member_roles"("league_id", "user_id");

CREATE INDEX "league_renewal_member_roles_user_id_idx"
ON "league_renewal_member_roles"("user_id");

ALTER TABLE "league_renewal_member_roles"
ADD CONSTRAINT "league_renewal_member_roles_league_id_fkey"
FOREIGN KEY ("league_id") REFERENCES "leagues"("league_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "league_renewal_member_roles"
ADD CONSTRAINT "league_renewal_member_roles_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "people"("uid") ON DELETE CASCADE ON UPDATE CASCADE;
