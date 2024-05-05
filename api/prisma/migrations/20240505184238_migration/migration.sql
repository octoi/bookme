/*
  Warnings:

  - A unique constraint covering the columns `[slot_id]` on the table `booking` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "booking_slot_id_key" ON "booking"("slot_id");
