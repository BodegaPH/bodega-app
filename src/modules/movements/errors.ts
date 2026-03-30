export class MovementApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "MovementApiError";
    this.status = status;
  }
}

export class InsufficientStockError extends MovementApiError {
  constructor(message: string) {
    super(message, 409);
    this.name = "InsufficientStockError";
  }
}
