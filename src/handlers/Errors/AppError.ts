export class AppError extends Error {
  status: string;
  statusCode: number;
  isOperational: boolean;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ManageSalaryError";
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Object.setPrototypeOf(this, AppError.prototype);
  }
}
