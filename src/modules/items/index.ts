/**
 * Items Module - Public exports
 */
export {
  // Service functions
  getItems,
  createItem,
  updateItem,
  deleteItem,
  reactivateItem,
  validateForMovement,
  getItemsForSelect,
  getDataCount,
  // Error class
  ItemApiError,
} from "./service";

export type {
  ItemDTO,
  ItemReference,
  ItemValidationResult,
  CreateItemInput,
  UpdateItemInput,
} from "./types";
