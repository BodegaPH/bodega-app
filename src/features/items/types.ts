// Re-export types from module for client components
// Import directly from types.ts to avoid pulling in Prisma
export type {
  ItemDTO,
  ItemReference,
  ItemValidationResult,
  CreateItemInput,
  UpdateItemInput,
} from "@/modules/items/types";
