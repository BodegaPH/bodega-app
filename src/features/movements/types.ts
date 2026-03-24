export enum MovementType {
  RECEIVE = "RECEIVE",
  ISSUE = "ISSUE",
  ADJUSTMENT = "ADJUSTMENT",
}

export interface MovementDTO {
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
}

export interface CreateMovementInput {
  itemId: string;
  locationId: string;
  createdById: string;
  type: MovementType;
  quantity: number;
  reason?: string | null;
}

export interface ListMovementsResponse {
  movements: MovementDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
