import type { ItemReference } from "@/modules/items";
import type { LocationReference } from "@/modules/locations";

export type InventoryRow = {
  id: string;
  quantity: string;
  item: {
    id: string;
    name: string;
    sku: string;
    unit: string;
    category: string | null;
    lowStockThreshold: string | null;
  };
  location: {
    id: string;
    name: string;
  };
};

export type InventoryPageData = {
  inventory: InventoryRow[];
  items: ItemReference[];
  locations: (LocationReference & { isDefault: boolean })[];
};
