/*
  Warnings:

  - You are about to drop the column `jumlah` on the `activity_logs` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[kode_aset,lokasi_lantai]` on the table `assets` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `assets_kode_aset_idx` ON `assets`;

-- DropIndex
DROP INDEX `assets_kode_aset_key` ON `assets`;

-- AlterTable
ALTER TABLE `activity_logs` DROP COLUMN `jumlah`;

-- CreateIndex
CREATE UNIQUE INDEX `assets_kode_aset_lokasi_lantai_key` ON `assets`(`kode_aset`, `lokasi_lantai`);
