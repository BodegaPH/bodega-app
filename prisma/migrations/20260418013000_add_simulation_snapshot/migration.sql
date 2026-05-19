-- CreateTable
CREATE TABLE "SimulationSnapshot" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "horizonDays" INTEGER NOT NULL,
    "iterations" INTEGER NOT NULL,
    "lookbackDays" INTEGER NOT NULL,
    "stockoutProbability" DECIMAL(5,4) NOT NULL,
    "p10EndingStock" DECIMAL(12,2) NOT NULL,
    "p50EndingStock" DECIMAL(12,2) NOT NULL,
    "p90EndingStock" DECIMAL(12,2) NOT NULL,
    "meanDailyDemand" DECIMAL(12,4) NOT NULL,
    "demandStdDev" DECIMAL(12,4) NOT NULL,
    "sampleSizeDays" INTEGER NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SimulationSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SimulationSnapshot_orgId_itemId_locationId_horizonDays_key" ON "SimulationSnapshot"("orgId", "itemId", "locationId", "horizonDays");

-- CreateIndex
CREATE INDEX "SimulationSnapshot_orgId_generatedAt_idx" ON "SimulationSnapshot"("orgId", "generatedAt");

-- CreateIndex
CREATE INDEX "SimulationSnapshot_orgId_stockoutProbability_idx" ON "SimulationSnapshot"("orgId", "stockoutProbability");

-- AddForeignKey
ALTER TABLE "SimulationSnapshot" ADD CONSTRAINT "SimulationSnapshot_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationSnapshot" ADD CONSTRAINT "SimulationSnapshot_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationSnapshot" ADD CONSTRAINT "SimulationSnapshot_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
