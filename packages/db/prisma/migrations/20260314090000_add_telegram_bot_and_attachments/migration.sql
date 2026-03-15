-- AlterTable
ALTER TABLE "User" ADD COLUMN "telegramUserId" TEXT;

-- CreateTable
CREATE TABLE "TelegramOnboardingToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelegramOnboardingToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramUserId_key" ON "User"("telegramUserId");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramOnboardingToken_token_key" ON "TelegramOnboardingToken"("token");

-- CreateIndex
CREATE INDEX "TelegramOnboardingToken_userId_idx" ON "TelegramOnboardingToken"("userId");

-- AddForeignKey
ALTER TABLE "TelegramOnboardingToken" ADD CONSTRAINT "TelegramOnboardingToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
