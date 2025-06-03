import { Request, Response } from "express";
import { database } from "../db/database";
import { Movie, Producer } from "../types/producer.types";

interface MovieProducerRelationship {
  title: string;
  year: number;
  producer_name: string;
}

export class HelperController {
  static getMovies(_: Request, res: Response): void {
    const db = database.getDatabase();

    db.all("SELECT * FROM movies", (err: Error | null, rows: Movie[]) => {
      if (err) {
        res.status(500).json({
          message: "Error fetching movies",
          error: err.message,
        });
      } else {
        res.json({
          message: "Movies fetched successfully",
          count: rows.length,
          movies: rows,
        });
      }
    });
  }

  static getProducers(_: Request, res: Response): void {
    const db = database.getDatabase();

    db.all("SELECT * FROM producers", (err: Error | null, rows: Producer[]) => {
      if (err) {
        res.status(500).json({
          message: "Error fetching producers",
          error: err.message,
        });
      } else {
        res.json({
          message: "Producers fetched successfully",
          count: rows.length,
          producers: rows,
        });
      }
    });
  }

  static getMovieProducers(_: Request, res: Response): void {
    const db = database.getDatabase();

    const query = `
      SELECT
        m.title,
        m.year,
        p.name as producer_name
      FROM movies m
      JOIN movie_producers mp ON m.id = mp.movie_id
      JOIN producers p ON mp.producer_id = p.id
      WHERE m.winner = 1
      ORDER BY m.year
    `;

    db.all(query, (err: Error | null, rows: MovieProducerRelationship[]) => {
      if (err) {
        res.status(500).json({
          message: "Error fetching movie-producer relationships",
          error: err.message,
        });
      } else {
        res.json({
          message: "Movie-producer relationships fetched successfully",
          count: rows.length,
          relationships: rows,
        });
      }
    });
  }
}
