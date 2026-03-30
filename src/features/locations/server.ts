// Server-only exports - DO NOT import in Client Components
// Re-exports from @/modules/locations
export {
  LocationApiError,
  createLocation,
  deleteLocation,
  getLocations,
  getLocationsForSelect,
  updateLocation,
  validateForMovement as validateLocationForMovement,
  getDataCount,
} from "@/modules/locations";

export type {
  LocationDTO,
  LocationReference,
  LocationValidationResult,
  CreateLocationInput,
  UpdateLocationInput,
} from "@/modules/locations";
