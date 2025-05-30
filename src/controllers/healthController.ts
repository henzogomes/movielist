import { Request, Response } from "express";
import { database } from "../db/database";

export class HealthController {
  static getHealth(req: Request, res: Response): void {
    const db = database.getDatabase();

    db.get("SELECT datetime('now') as current_time", (err, row: any) => {
      if (err) {
        res.status(500).json({
          message: "Database connection failed",
          error: err.message,
        });
      } else {
        res.json({
          message: "API is healthy",
          database: "SQLite in-memory database connected",
          currentTime: row.current_time,
        });
      }
    });
  }
}
