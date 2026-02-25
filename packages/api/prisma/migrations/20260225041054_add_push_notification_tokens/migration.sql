-- CreateTable
CREATE TABLE "pushNotificationTokens" (
    "push_token_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "platform" VARCHAR(32),
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "last_seen_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pushNotificationTokens_pkey" PRIMARY KEY ("push_token_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pushNotificationTokens_token_key" ON "pushNotificationTokens"("token");

-- CreateIndex
CREATE INDEX "idx_push_tokens_user" ON "pushNotificationTokens"("user_id");

-- CreateIndex
CREATE INDEX "idx_push_tokens_enabled" ON "pushNotificationTokens"("enabled");

-- AddForeignKey
ALTER TABLE "pushNotificationTokens" ADD CONSTRAINT "pushNotificationTokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "people"("uid") ON DELETE CASCADE ON UPDATE CASCADE;
