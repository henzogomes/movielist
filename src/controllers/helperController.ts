import { Request, Response } from "express";
import { database } from "../db/database";
import { Movie, Producer } from "../types/producer.types";
import { PaginationHelper, PaginationParams } from "../utils/pagination";

interface MovieProducerRelationship {
  title: string;
  year: number;
  producer_name: string;
}

export class HelperController {
  static async getMovies(req: Request, res: Response): Promise<void> {
    try {
      const db = database.getDatabase();
      const pagination = PaginationHelper.parseParams(
        req.query as PaginationParams
      );
      const baseQuery = "SELECT * FROM movies ORDER BY year, title";

      const response = await PaginationHelper.getPaginatedData<Movie>(
        db,
        baseQuery,
        pagination,
        "Movies fetched successfully"
      );

      res.json(response);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching movies",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async getProducers(req: Request, res: Response): Promise<void> {
    try {
      const db = database.getDatabase();
      const pagination = PaginationHelper.parseParams(
        req.query as PaginationParams
      );
      const baseQuery = "SELECT * FROM producers ORDER BY name";

      const response = await PaginationHelper.getPaginatedData<Producer>(
        db,
        baseQuery,
        pagination,
        "Producers fetched successfully"
      );

      res.json(response);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching producers",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async getMovieProducers(req: Request, res: Response): Promise<void> {
    try {
      const db = database.getDatabase();
      const pagination = PaginationHelper.parseParams(
        req.query as PaginationParams
      );

      const baseQuery = `
        SELECT
          m.title,
          m.year,
          p.name as producer_name
        FROM movies m
        JOIN movie_producers mp ON m.id = mp.movie_id
        JOIN producers p ON mp.producer_id = p.id
        WHERE m.winner = 1
        ORDER BY m.year, m.title
      `;

      const response =
        await PaginationHelper.getPaginatedData<MovieProducerRelationship>(
          db,
          baseQuery,
          pagination,
          "Movie-producer relationships fetched successfully"
        );

      res.json(response);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching movie-producer relationships",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
