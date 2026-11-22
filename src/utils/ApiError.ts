export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
  static badRequest(m = "Bad request", d?: unknown) { return new ApiError(400, m, d); }
  static unauthorized(m = "Unauthorized") { return new ApiError(401, m); }
  static forbidden(m = "You do not have permission to do that") { return new ApiError(403, m); }
  static notFound(m = "Not found") { return new ApiError(404, m); }
  static conflict(m = "Conflict") { return new ApiError(409, m); }
}
