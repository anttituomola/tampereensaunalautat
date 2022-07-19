/*
  Warnings:

  - Made the column `url` on table `Lautta` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Lautta" ADD COLUMN     "eventLength" INTEGER,
ADD COLUMN     "urlArray" TEXT[],
ALTER COLUMN "url" SET NOT NULL;
