-- CreateTable
CREATE TABLE `assets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(255) NOT NULL,
    `kode_aset` VARCHAR(100) NOT NULL,
    `kategori` VARCHAR(100) NOT NULL,
    `lokasi_lantai` INTEGER NOT NULL,
    `kondisi` VARCHAR(50) NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `assets_kode_aset_key`(`kode_aset`),
    INDEX `assets_lokasi_lantai_idx`(`lokasi_lantai`),
    INDEX `assets_kode_aset_idx`(`kode_aset`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activity_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `asset_id` INTEGER NOT NULL,
    `action` ENUM('CREATE', 'UPDATE', 'MOVE', 'DELETE') NOT NULL,
    `lantai_asal` INTEGER NULL,
    `lantai_tujuan` INTEGER NULL,
    `deskripsi` TEXT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `activity_logs_asset_id_idx`(`asset_id`),
    INDEX `activity_logs_action_idx`(`action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `activity_logs` ADD CONSTRAINT `activity_logs_asset_id_fkey` FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
