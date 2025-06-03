import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error("Error:", {
    message: error.message,
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
  });

  let statusCode = 500;
  let message = "Internal server error";

  if (error.message.includes("CSV validation failed")) {
    statusCode = 400;
    message = error.message;
  } else if (error.message.includes("not found")) {
    statusCode = 404;
    message = error.message;
  }

  res.status(statusCode).json({
    error: {
      message,
      timestamp: new Date().toISOString(),
    },
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      timestamp: new Date().toISOString(),
    },
  });
};
