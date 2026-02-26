/*
  Warnings:

  - You are about to drop the column `isPasswordTemp` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isPasswordTemp",
DROP COLUMN "password",
DROP COLUMN "username",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "name" TEXT;

-- CreateTable
CREATE TABLE "MagicToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MagicToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "caseType" TEXT NOT NULL,
    "caseNo" TEXT NOT NULL,
    "caseYear" INTEGER NOT NULL,
    "cnrNo" TEXT,
    "filingNo" TEXT,
    "regDate" TIMESTAMP(3),
    "petName" TEXT,
    "resName" TEXT,
    "petAdvName" TEXT,
    "resAdvName" TEXT,
    "benchName" TEXT,
    "status" TEXT,
    "category" TEXT,
    "categoryDesc" TEXT,
    "district" TEXT,
    "establishment" TEXT,
    "nextListingDate" TIMESTAMP(3),
    "disposalDate" TIMESTAMP(3),
    "disposalType" TEXT,
    "rawData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseParty" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "srNo" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "email" TEXT,
    "mobile" TEXT,
    "age" INTEGER,
    "sex" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseParty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseHearing" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "hearingDate" TIMESTAMP(3) NOT NULL,
    "benchCode" INTEGER,
    "benchName" TEXT,
    "benchType" TEXT,
    "srNo" INTEGER,
    "listType" TEXT,
    "hearingStatus" TEXT,
    "courtNo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseHearing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseOrder" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL,
    "orderType" TEXT,
    "benchName" TEXT,
    "benchCode" INTEGER,
    "pdfUrl" TEXT,
    "pdfName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseObjection" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "rawData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseObjection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MagicToken_token_key" ON "MagicToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "MagicToken_userId_key" ON "MagicToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Case_caseType_caseNo_caseYear_key" ON "Case"("caseType", "caseNo", "caseYear");

-- CreateIndex
CREATE UNIQUE INDEX "CaseHearing_caseId_hearingDate_srNo_key" ON "CaseHearing"("caseId", "hearingDate", "srNo");

-- CreateIndex
CREATE UNIQUE INDEX "CaseOrder_caseId_orderDate_orderType_key" ON "CaseOrder"("caseId", "orderDate", "orderType");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "MagicToken" ADD CONSTRAINT "MagicToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseParty" ADD CONSTRAINT "CaseParty_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseHearing" ADD CONSTRAINT "CaseHearing_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseOrder" ADD CONSTRAINT "CaseOrder_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseObjection" ADD CONSTRAINT "CaseObjection_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
