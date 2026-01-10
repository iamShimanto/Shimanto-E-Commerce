import type { Response } from "express";

export class responseHandler {
  static success(
    res: Response,
    statusCode: number,
    message: string,
    data: unknown = {}
  ) {
    return res.status(statusCode).send({
      success: true,
      message,
      data,
    });
  }

  static error(
    res: Response,
    statusCode: number,
    message: string,
    error: unknown = null
  ) {
    if (error) console.log(error);

    return res.status(statusCode).send({
      success: false,
      message,
      error: error instanceof Error ? error.message : null,
    });
  }
}
