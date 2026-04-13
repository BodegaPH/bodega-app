import { MovementType } from "./types";

export interface MovementExportRow {
  movementId: string;
  type: MovementType;
  quantity: string;
  unit: string;
  itemName: string;
  sku: string;
  location: string;
  reason: string;
  createdByName: string;
  createdByEmail: string;
  createdAt: Date;
}

const BOM = "\uFEFF";
const DANGEROUS_CELL_PREFIX = /^[=+\-@\t\r]/;
const CSV_HEADERS = [
  "movement_id",
  "type",
  "quantity",
  "unit",
  "item_name",
  "sku",
  "location",
  "reason",
  "created_by_name",
  "created_by_email",
  "created_at_iso",
  "created_at_localized",
];

function hardenCsvValue(value: string): string {
  const normalized = value;
  const safe = DANGEROUS_CELL_PREFIX.test(normalized) ? `'${normalized}` : normalized;

  if (safe.includes(",") || safe.includes('"') || safe.includes("\n") || safe.includes("\r")) {
    return `"${safe.replace(/"/g, '""')}"`;
  }

  return safe;
}

export function generateMovementCsv(rows: MovementExportRow[]) {
  const lines: string[] = [CSV_HEADERS.join(",")];
  const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
    timeZoneName: "short",
  });

  for (const row of rows) {
    const createdAtIso = row.createdAt.toISOString();
    const createdAtLocalized = dateTimeFormatter.format(row.createdAt);

    const values = [
      hardenCsvValue(row.movementId),
      hardenCsvValue(row.type),
      hardenCsvValue(row.quantity),
      hardenCsvValue(row.unit),
      hardenCsvValue(row.itemName),
      hardenCsvValue(row.sku),
      hardenCsvValue(row.location),
      hardenCsvValue(row.reason),
      hardenCsvValue(row.createdByName),
      hardenCsvValue(row.createdByEmail),
      hardenCsvValue(createdAtIso),
      hardenCsvValue(createdAtLocalized),
    ];

    lines.push(values.join(","));
  }

  return `${BOM}${lines.join("\n")}`;
}
