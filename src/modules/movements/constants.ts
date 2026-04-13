export const MOVEMENT_EXPORT_SYNC_ROW_CAP = 5000;
export const MOVEMENT_EXPORT_TIMEOUT_MS = 8000;

export const MOVEMENT_EXPORT_RATE_LIMITS = {
  perUserPerOrg: {
    windowMs: 60_000,
    maxRequests: 3,
  },
  perOrg: {
    windowMs: 60_000,
    maxRequests: 10,
  },
} as const;
