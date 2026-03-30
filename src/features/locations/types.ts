// Re-export types from module for client components
// Import directly from types.ts to avoid pulling in Prisma
export type {
  LocationDTO,
  LocationReference,
  LocationValidationResult,
  CreateLocationInput,
  UpdateLocationInput,
} from "@/modules/locations/types";
