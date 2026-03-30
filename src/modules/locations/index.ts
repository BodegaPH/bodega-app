/**
 * Locations Module - Public exports
 */
export {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  validateForMovement,
  getLocationsForSelect,
  getDataCount,
  LocationApiError,
} from "./service";

export type {
  LocationDTO,
  LocationReference,
  LocationValidationResult,
  CreateLocationInput,
  UpdateLocationInput,
} from "./types";
