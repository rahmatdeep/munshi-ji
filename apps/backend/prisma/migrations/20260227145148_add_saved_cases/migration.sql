-- CreateTable
CREATE TABLE "_CaseToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CaseToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CaseToUser_B_index" ON "_CaseToUser"("B");

-- AddForeignKey
ALTER TABLE "_CaseToUser" ADD CONSTRAINT "_CaseToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CaseToUser" ADD CONSTRAINT "_CaseToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
