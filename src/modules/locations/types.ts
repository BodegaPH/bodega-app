export type LocationDTO = {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type LocationReference = {
  id: string;
  name: string;
};

export type LocationValidationResult =
  | { valid: true; location: LocationReference }
  | { valid: false; reason: string };

export type CreateLocationInput = {
  name: string;
  isDefault?: boolean;
};

export type UpdateLocationInput = {
  name?: string;
  isDefault?: boolean;
};
