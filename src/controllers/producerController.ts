import { Request, Response } from "express";
import { ProducerAnalyticsService } from "../services/producerAnalyticsService";

export class ProducerController {
  static async getProducerIntervals(_: Request, res: Response): Promise<void> {
    try {
      const intervals = await ProducerAnalyticsService.getProducerIntervals();
      res.json(intervals);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching producer intervals",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
