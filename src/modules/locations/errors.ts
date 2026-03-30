export class LocationApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "LocationApiError";
    this.status = status;
  }
}
