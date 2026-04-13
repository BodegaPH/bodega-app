export enum MovementType {
  RECEIVE = "RECEIVE",
  ISSUE = "ISSUE",
  ADJUSTMENT = "ADJUSTMENT",
}

export type MovementDTO = {
  id: string;
  type: MovementType;
  quantity: string;
  reason: string | null;
  createdAt: string;
  item?: {
    id: string;
    name: string;
    sku: string;
    unit: string;
  };
  location?: {
    id: string;
    name: string;
  };
  createdBy?: {
    id: string;
    name: string | null;
    email: string | null;
  };
};

export type CreateMovementInput = {
  itemId: string;
  locationId: string;
  createdById: string;
  type: MovementType;
  quantity: number;
  reason: string | null;
};

export type GetMovementsFilters = {
  itemId?: string;
  locationId?: string;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
};

export type ListMovementsResponse = {
  movements: MovementDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type MovementExportMode = "filtered" | "all";

export type MovementExportFilters = {
  itemId?: string;
  locationId?: string;
  from?: string;
  to?: string;
};

export type MovementExportRequest = {
  mode: MovementExportMode;
  filters?: MovementExportFilters;
  confirmedAll?: boolean;
};

export type MovementExportErrorCode =
  | "INVALID_FILTERS"
  | "EXPORT_CAP_EXCEEDED"
  | "EXPORT_TIMEOUT"
  | "RATE_LIMITED"
  | "SERVER_ERROR";

export type MovementExportSuccess = {
  filename: string;
  content: string;
  rowCount: number;
  generatedAt: string;
};
