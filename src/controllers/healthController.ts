import { Request, Response } from "express";
import { database } from "../db/database";

interface DatabaseTimeResult {
  current_time: string;
}

export class HealthController {
  static getHealth(_: Request, res: Response): void {
    if (!database.isReady()) {
      res.status(503).json({
        message: "Database not ready",
        status: "initializing",
        database: "SQLite in-memory database initializing",
      });
      return;
    }

    const db = database.getDatabase();

    db.get(
      "SELECT datetime('now') as current_time",
      (err: Error | null, row: DatabaseTimeResult) => {
        if (err) {
          res.status(500).json({
            message: "Database connection failed",
            error: err.message,
            status: "error",
          });
        } else {
          res.json({
            message: "API is healthy",
            status: "ready",
            database: "SQLite in-memory database connected",
            currentTime: row.current_time,
          });
        }
      }
    );
  }
}
