export type MonteCarloConfig = {
  horizonDays: number;
  iterations: number;
  lookbackDays: number;
  seed?: number;
};

export type GetTopRiskOptions = Partial<MonteCarloConfig> & {
  limit?: number;
};

export type RecomputeTarget = {
  orgId: string;
  itemId: string;
  locationId: string;
};

export type SimulationMetrics = {
  stockoutProbability: number;
  p10EndingStock: number;
  p50EndingStock: number;
  p90EndingStock: number;
  meanDailyDemand: number;
  demandStdDev: number;
  sampleSizeDays: number;
};

export type SimulationSnapshotDTO = {
  id: string;
  orgId: string;
  itemId: string;
  locationId: string;
  itemName: string;
  itemSku: string;
  locationName: string;
  horizonDays: number;
  iterations: number;
  lookbackDays: number;
  stockoutProbability: number;
  p10EndingStock: number;
  p50EndingStock: number;
  p90EndingStock: number;
  meanDailyDemand: number;
  demandStdDev: number;
  sampleSizeDays: number;
  generatedAt: string;
  updatedAt: string;
};
