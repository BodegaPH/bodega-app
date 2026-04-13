import { describe, expect, it } from "vitest";
import { generateMovementCsv } from "../csv-generator";
import { MovementType } from "../types";

describe("movement csv generator", () => {
  it("includes UTF-8 BOM and expected column order", () => {
    const csv = generateMovementCsv([
      {
        movementId: "mov_1",
        type: MovementType.RECEIVE,
        quantity: "10",
        unit: "pcs",
        itemName: "Widget",
        sku: "W-1",
        location: "Main",
        reason: "",
        createdByName: "Admin",
        createdByEmail: "admin@example.com",
        createdAt: new Date("2026-04-01T10:30:00.000Z"),
      },
    ]);

    expect(csv.startsWith("\uFEFF")).toBe(true);
    const [header] = csv.slice(1).split("\n");
    expect(header).toBe(
      "movement_id,type,quantity,unit,item_name,sku,location,reason,created_by_name,created_by_email,created_at_iso,created_at_localized",
    );
  });

  it("escapes RFC4180 values and hardens formula injection", () => {
    const csv = generateMovementCsv([
      {
        movementId: "=BAD",
        type: MovementType.ADJUSTMENT,
        quantity: "-1",
        unit: "p,cs",
        itemName: 'Widget "Deluxe"',
        sku: "+X",
        location: "Main",
        reason: "@calc",
        createdByName: "\tname",
        createdByEmail: "\rmail@example.com",
        createdAt: new Date("2026-04-01T10:30:00.000Z"),
      },
    ]);

    expect(csv).toContain("'=BAD");
    expect(csv).toContain('"p,cs"');
    expect(csv).toContain('"Widget ""Deluxe"""');
    expect(csv).toContain("'+X");
    expect(csv).toContain("'@calc");
    expect(csv).toContain("'\tname");
    expect(csv).toContain("\"'\rmail@example.com\"");
  });

  it("includes ISO and localized timestamp columns", () => {
    const csv = generateMovementCsv([
      {
        movementId: "mov_1",
        type: MovementType.RECEIVE,
        quantity: "10",
        unit: "pcs",
        itemName: "Widget",
        sku: "W-1",
        location: "Main",
        reason: "",
        createdByName: "Admin",
        createdByEmail: "admin@example.com",
        createdAt: new Date("2026-04-01T10:30:00.000Z"),
      },
    ]);

    const [, row] = csv.slice(1).split("\n");
    expect(row).toContain("2026-04-01T10:30:00.000Z");
    expect(row).toContain("UTC");
  });
});
