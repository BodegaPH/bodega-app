export interface LocationDTO {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLocationInput {
  name?: unknown;
  isDefault?: unknown;
}

export interface UpdateLocationInput {
  name?: unknown;
  isDefault?: unknown;
}
