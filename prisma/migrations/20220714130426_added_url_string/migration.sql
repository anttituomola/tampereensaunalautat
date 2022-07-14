/*
  Warnings:

  - A unique constraint covering the columns `[url_name]` on the table `Lautta` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Lautta_name_key";

-- AlterTable
ALTER TABLE "Lautta" ADD COLUMN     "url_name" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Lautta_url_name_key" ON "Lautta"("url_name");
