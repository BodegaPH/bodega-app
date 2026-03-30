export type ItemDTO = {
  id: string;
  name: string;
  sku: string;
  unit: string;
  category: string | null;
  isActive: boolean;
  lowStockThreshold: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ItemReference = {
  id: string;
  name: string;
  sku: string;
  unit: string;
};

export type ItemValidationResult =
  | { valid: true; item: ItemReference }
  | { valid: false; reason: string };

export type CreateItemInput = {
  name: string;
  sku: string;
  unit: string;
  category?: string | null;
  lowStockThreshold?: string | number | null;
};

export type UpdateItemInput = {
  name?: string;
  unit?: string;
  category?: string | null;
  lowStockThreshold?: string | number | null;
};
