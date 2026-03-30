export class OrganizationsApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "OrganizationsApiError";
    this.status = status;
  }
}
