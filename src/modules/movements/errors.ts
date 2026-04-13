export class MovementApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = "MovementApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class InsufficientStockError extends MovementApiError {
  constructor(message: string) {
    super(message, 409);
    this.name = "InsufficientStockError";
  }
}

export class InvalidMovementExportFiltersError extends MovementApiError {
  constructor(message: string) {
    super(message, 400, "INVALID_FILTERS");
    this.name = "InvalidMovementExportFiltersError";
  }
}

export class MovementExportCapExceededError extends MovementApiError {
  constructor(message = "Export exceeds sync limit. Please narrow your filters and try again.") {
    super(message, 422, "EXPORT_CAP_EXCEEDED");
    this.name = "MovementExportCapExceededError";
  }
}

export class MovementExportTimeoutError extends MovementApiError {
  constructor(message = "Export timed out. Please narrow your filters and try again.") {
    super(message, 408, "EXPORT_TIMEOUT");
    this.name = "MovementExportTimeoutError";
  }
}

export class MovementExportRateLimitedError extends MovementApiError {
  retryAfterSeconds: number;

  constructor(retryAfterSeconds: number, message = "Too many export requests. Please try again shortly.") {
    super(message, 429, "RATE_LIMITED", { retryAfterSeconds });
    this.name = "MovementExportRateLimitedError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class MovementExportServerError extends MovementApiError {
  constructor(message = "Failed to export movement ledger. Please try again.") {
    super(message, 500, "SERVER_ERROR");
    this.name = "MovementExportServerError";
  }
}
