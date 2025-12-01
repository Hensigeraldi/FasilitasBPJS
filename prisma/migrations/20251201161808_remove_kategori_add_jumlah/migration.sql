/*
  Warnings:

  - You are about to drop the column `kategori` on the `assets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `activity_logs` ADD COLUMN `jumlah` INTEGER NULL;

-- AlterTable
ALTER TABLE `assets` DROP COLUMN `kategori`,
    ADD COLUMN `jumlah` INTEGER NOT NULL DEFAULT 1;
