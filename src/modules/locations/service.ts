/**
 * Locations Service - Public API for the locations module
 */
import * as repo from "./repository";
import { LocationApiError } from "./errors";
import type {
  LocationDTO,
  LocationReference,
  LocationValidationResult,
  CreateLocationInput,
  UpdateLocationInput,
} from "./types";

export { LocationApiError } from "./errors";
export type {
  LocationDTO,
  LocationReference,
  LocationValidationResult,
  CreateLocationInput,
  UpdateLocationInput,
} from "./types";

function validateName(name: unknown): string {
  if (typeof name !== "string") {
    throw new LocationApiError("Location name is required", 400);
  }

  const trimmed = name.trim();
  if (!trimmed) {
    throw new LocationApiError("Location name is required", 400);
  }

  if (trimmed.length > 100) {
    throw new LocationApiError("Location name must be 100 characters or fewer", 400);
  }

  return trimmed;
}

export async function getLocations(orgId: string): Promise<LocationDTO[]> {
  return repo.listLocations(orgId);
}

export async function createLocation(
  orgId: string,
  input: CreateLocationInput
): Promise<LocationDTO> {
  const name = validateName(input.name);
  const desiredDefault = Boolean(input.isDefault);

  const existingByName = await repo.findByName(orgId, name);
  if (existingByName) {
    throw new LocationApiError("A location with this name already exists", 409);
  }

  const currentDefault = await repo.findCurrentDefault(orgId);
  const makeDefault = desiredDefault || !currentDefault;

  try {
    return await repo.createLocationWithDefault(orgId, name, makeDefault);
  } catch (error) {
    if (repo.isUniqueError(error)) {
      throw new LocationApiError("A location with this name already exists", 409);
    }
    throw error;
  }
}

export async function updateLocation(
  orgId: string,
  id: string,
  input: UpdateLocationInput
): Promise<LocationDTO> {
  const hasName = "name" in input;
  const hasIsDefault = "isDefault" in input;

  if (!hasName && !hasIsDefault) {
    throw new LocationApiError("No valid fields provided for update", 400);
  }

  const location = await repo.findLocationById(orgId, id);
  if (!location) {
    throw new LocationApiError("Location not found", 404);
  }

  let nextName: string | undefined;
  if (hasName) {
    nextName = validateName(input.name);

    const duplicate = await repo.findByName(orgId, nextName, id);
    if (duplicate) {
      throw new LocationApiError("A location with this name already exists", 409);
    }
  }

  if (hasIsDefault && typeof input.isDefault !== "boolean") {
    throw new LocationApiError("isDefault must be a boolean", 400);
  }

  if (input.isDefault === false && location.isDefault) {
    throw new LocationApiError("A default location is required", 409);
  }

  try {
    return await repo.updateLocationWithDefault(orgId, id, nextName, input.isDefault === true);
  } catch (error) {
    if (repo.isUniqueError(error)) {
      throw new LocationApiError("A location with this name already exists", 409);
    }
    throw error;
  }
}

export async function deleteLocation(orgId: string, id: string): Promise<void> {
  const location = await repo.findLocationById(orgId, id);
  if (!location) {
    throw new LocationApiError("Location not found", 404);
  }

  if (location.isDefault) {
    throw new LocationApiError("Default location cannot be deleted", 409);
  }

  const stockCount = await repo.countStockAtLocation(orgId, id);
  if (stockCount > 0) {
    throw new LocationApiError("Location cannot be deleted because stock exists", 409);
  }

  await repo.deleteLocation(id);
}

/**
 * Validate a location exists for use in movements.
 * Cross-module service function.
 */
export async function validateForMovement(
  orgId: string,
  locationId: string
): Promise<LocationValidationResult> {
  const location = await repo.findLocationForValidation(orgId, locationId);

  if (!location) {
    return { valid: false, reason: "Location not found" };
  }

  return {
    valid: true,
    location: { id: location.id, name: location.name },
  };
}

/**
 * Get locations for dropdown/select components.
 * Cross-module service function.
 */
export async function getLocationsForSelect(
  orgId: string
): Promise<(LocationReference & { isDefault: boolean })[]> {
  return repo.listLocationsForSelect(orgId);
}

/**
 * Get count of locations in organization.
 * Cross-module service function for aggregation.
 */
export async function getDataCount(orgId: string): Promise<number> {
  return repo.countLocations(orgId);
}
