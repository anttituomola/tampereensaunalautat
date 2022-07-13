-- CreateTable
CREATE TABLE "Lautta" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "pricemin" INTEGER NOT NULL,
    "pricemax" INTEGER NOT NULL,
    "equipment" TEXT[],
    "images" TEXT[],
    "mainImage" TEXT NOT NULL,

    CONSTRAINT "Lautta_pkey" PRIMARY KEY ("id")
);
