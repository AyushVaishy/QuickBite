-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "closingTime" TEXT DEFAULT '23:00',
ADD COLUMN     "fssaiNumber" TEXT,
ADD COLUMN     "openingTime" TEXT DEFAULT '09:00',
ADD COLUMN     "phone" TEXT;
