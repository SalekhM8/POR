-- AlterTable: Booking add startTime/endTime
ALTER TABLE "public"."Booking" ADD COLUMN "startTime" TIMESTAMP(3);
ALTER TABLE "public"."Booking" ADD COLUMN "endTime" TIMESTAMP(3);

-- CreateTable: AvailabilityRule
CREATE TABLE "public"."AvailabilityRule" (
  "id" TEXT NOT NULL,
  "weekday" INTEGER NOT NULL,
  "startMinutes" INTEGER NOT NULL,
  "endMinutes" INTEGER NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AvailabilityRule_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AvailabilityRule_weekday_idx" ON "public"."AvailabilityRule"("weekday");

-- CreateTable: TimeBlock
CREATE TABLE "public"."TimeBlock" (
  "id" TEXT NOT NULL,
  "start" TIMESTAMP(3) NOT NULL,
  "end" TIMESTAMP(3) NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TimeBlock_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "TimeBlock_start_idx" ON "public"."TimeBlock"("start");
CREATE INDEX "TimeBlock_end_idx" ON "public"."TimeBlock"("end");

-- CreateTable: RecurringBlock
CREATE TABLE "public"."RecurringBlock" (
  "id" TEXT NOT NULL,
  "weekday" INTEGER NOT NULL,
  "startMinutes" INTEGER NOT NULL,
  "endMinutes" INTEGER NOT NULL,
  "startsOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endsOn" TIMESTAMP(3),
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RecurringBlock_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "RecurringBlock_weekday_idx" ON "public"."RecurringBlock"("weekday");


