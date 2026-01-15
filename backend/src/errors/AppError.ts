export class AppError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: unknown
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// helpers comunes (sin inflar)
export const badRequest = (message = "bad request", details?: unknown) =>
  new AppError(400, "BAD_REQUEST", message, details);

export const unauthorized = (message = "unauthorized") =>
  new AppError(401, "UNAUTHORIZED", message);

export const forbidden = (message = "forbidden") =>
  new AppError(403, "FORBIDDEN", message);

export const notFound = (message = "not found") =>
  new AppError(404, "NOT_FOUND", message);

export const conflict = (message = "conflict") =>
  new AppError(409, "CONFLICT", message);
