export class UserFacingError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = 'UserFacingError';
    this.statusCode = statusCode;
  }
}
