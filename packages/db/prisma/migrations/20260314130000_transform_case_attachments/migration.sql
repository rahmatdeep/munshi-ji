-- Add telegramFileId to CaseAttachment
ALTER TABLE "CaseAttachment" ADD COLUMN "telegramFileId" TEXT;

-- Make title nullable
ALTER TABLE "CaseAttachment" ALTER COLUMN "title" DROP NOT NULL;
