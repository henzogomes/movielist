import { Request, Response } from "express";
import { database } from "../db/database";
import { ProducerService } from "../services/producerService";

export class ProducerController {
  static async getProducerIntervals(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const db = database.getDatabase();
      const intervals = await ProducerService.getProducerIntervals(db);

      res.json(intervals);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching producer intervals",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
