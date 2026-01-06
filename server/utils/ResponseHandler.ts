import type { Response } from "express";

export const successResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data: unknown = {}
) => {
  res.status(statusCode).send({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  error: unknown = null
) => {
  if (error) console.error(error);

  return res.status(statusCode).send({
    success: false,
    message,
    error: error instanceof Error ? error.message : null,
  });
};
