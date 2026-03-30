export class ItemApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ItemApiError";
    this.status = status;
  }
}
