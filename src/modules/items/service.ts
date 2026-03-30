/**
 * Items Service - Public API for the items module
 * This is the ONLY file that should be imported from outside this module
 */
import * as repo from "./repository";
import { ItemApiError } from "./errors";
import type {
  ItemDTO,
  ItemReference,
  ItemValidationResult,
  CreateItemInput,
  UpdateItemInput,
} from "./types";

// Re-export types and errors for external use
export { ItemApiError } from "./errors";
export type {
  ItemDTO,
  ItemReference,
  ItemValidationResult,
  CreateItemInput,
  UpdateItemInput,
} from "./types";

// === Validation Helpers ===

function validateRequiredText(value: unknown, fieldLabel: string, maxLength: number): string {
  if (typeof value !== "string") {
    throw new ItemApiError(`${fieldLabel} is required`, 400);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new ItemApiError(`${fieldLabel} is required`, 400);
  }

  if (trimmed.length > maxLength) {
    throw new ItemApiError(`${fieldLabel} must be ${maxLength} characters or fewer`, 400);
  }

  return trimmed;
}

function validateOptionalText(value: unknown, fieldLabel: string, maxLength: number): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new ItemApiError(`${fieldLabel} must be a string`, 400);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.length > maxLength) {
    throw new ItemApiError(`${fieldLabel} must be ${maxLength} characters or fewer`, 400);
  }

  return trimmed;
}

function validateOptionalPositiveDecimal(value: unknown): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    throw new ItemApiError("Low stock threshold must be a positive number", 400);
  }

  return numberValue.toFixed(2);
}

function asItemDTO(item: {
  id: string;
  name: string;
  sku: string;
  unit: string;
  category: string | null;
  isActive: boolean;
  lowStockThreshold: { toString(): string } | null;
  createdAt: Date;
  updatedAt: Date;
}): ItemDTO {
  return {
    ...item,
    lowStockThreshold: item.lowStockThreshold?.toString() ?? null,
  };
}

async function ensureItemExists(orgId: string, id: string): Promise<void> {
  const existing = await repo.findItemById(orgId, id);
  if (!existing) {
    throw new ItemApiError("Item not found", 404);
  }
}

// === Public API ===

export async function getItems(
  orgId: string,
  options?: { includeInactive?: boolean }
): Promise<ItemDTO[]> {
  const items = await repo.listItems(orgId, options?.includeInactive ?? false);
  return items.map(asItemDTO);
}

export async function createItem(orgId: string, input: CreateItemInput): Promise<ItemDTO> {
  const name = validateRequiredText(input.name, "Name", 120);
  const sku = validateRequiredText(input.sku, "SKU", 64).toUpperCase();
  const unit = validateRequiredText(input.unit, "Unit", 32);
  const category = validateOptionalText(input.category, "Category", 80);
  const lowStockThreshold = validateOptionalPositiveDecimal(input.lowStockThreshold);

  try {
    const item = await repo.createItem(orgId, { name, sku, unit, category, lowStockThreshold });
    return asItemDTO(item);
  } catch (error) {
    if (repo.isUniqueError(error)) {
      throw new ItemApiError("An item with this SKU already exists", 409);
    }
    throw error;
  }
}

export async function updateItem(
  orgId: string,
  id: string,
  input: UpdateItemInput
): Promise<ItemDTO> {
  if ("sku" in input) {
    throw new ItemApiError("SKU cannot be edited after item creation", 400);
  }

  const hasName = "name" in input;
  const hasUnit = "unit" in input;
  const hasCategory = "category" in input;
  const hasThreshold = "lowStockThreshold" in input;

  if (!hasName && !hasUnit && !hasCategory && !hasThreshold) {
    throw new ItemApiError("No valid fields provided for update", 400);
  }

  await ensureItemExists(orgId, id);

  const updateData: {
    name?: string;
    unit?: string;
    category?: string | null;
    lowStockThreshold?: string | null;
  } = {};

  if (hasName) {
    updateData.name = validateRequiredText(input.name, "Name", 120);
  }
  if (hasUnit) {
    updateData.unit = validateRequiredText(input.unit, "Unit", 32);
  }
  if (hasCategory) {
    updateData.category = validateOptionalText(input.category, "Category", 80);
  }
  if (hasThreshold) {
    updateData.lowStockThreshold = validateOptionalPositiveDecimal(input.lowStockThreshold);
  }

  try {
    const item = await repo.updateItem(id, updateData);
    return asItemDTO(item);
  } catch (error) {
    if (repo.isUniqueError(error)) {
      throw new ItemApiError("An item with this SKU already exists", 409);
    }
    throw error;
  }
}

export async function deleteItem(orgId: string, id: string): Promise<void> {
  await ensureItemExists(orgId, id);
  await repo.softDeleteItem(id);
}

export async function reactivateItem(orgId: string, id: string): Promise<void> {
  await ensureItemExists(orgId, id);
  await repo.reactivateItem(id);
}

/**
 * Validate an item exists and is active for use in movements.
 * Cross-module service function.
 */
export async function validateForMovement(
  orgId: string,
  itemId: string
): Promise<ItemValidationResult> {
  const item = await repo.findItemForValidation(orgId, itemId);

  if (!item) {
    return { valid: false, reason: "Item not found" };
  }

  if (!item.isActive) {
    return { valid: false, reason: "Cannot record movement for an inactive item" };
  }

  return {
    valid: true,
    item: { id: item.id, name: item.name, sku: item.sku, unit: item.unit },
  };
}

/**
 * Get items for dropdown/select components (active items only, minimal fields).
 * Cross-module service function.
 */
export async function getItemsForSelect(orgId: string): Promise<ItemReference[]> {
  return repo.listItemsForSelect(orgId);
}

/**
 * Get count of items in organization.
 * Cross-module service function for aggregation.
 */
export async function getDataCount(orgId: string): Promise<number> {
  return repo.countItems(orgId);
}
