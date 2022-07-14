/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Lautta` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Lautta_name_key" ON "Lautta"("name");
