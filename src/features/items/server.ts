// Server-only exports - DO NOT import in Client Components
// Re-exports from @/modules/items
export {
  ItemApiError,
  createItem,
  deleteItem,
  getItems,
  getItemsForSelect,
  reactivateItem,
  updateItem,
  validateForMovement as validateItemForMovement,
  getDataCount,
} from "@/modules/items";

export type {
  ItemDTO,
  ItemReference,
  ItemValidationResult,
  CreateItemInput,
  UpdateItemInput,
} from "@/modules/items";
