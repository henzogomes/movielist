import { Request, Response } from "express";
import { ProducerIntervalService } from "../services/producerIntervalService";

export class ProducerController {
  static async getProducerIntervals(_: Request, res: Response): Promise<void> {
    try {
      const intervals = await ProducerIntervalService.getProducerIntervals();
      res.json(intervals);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching producer intervals",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
