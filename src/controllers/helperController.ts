import { Request, Response } from "express";
import { database } from "../db/database";
import { Movie } from "../types/producer.types";

export class HelperController {
  static getMovies(req: Request, res: Response): void {
    const db = database.getDatabase();

    db.all("SELECT * FROM movies LIMIT 10", (err, rows: Movie[]) => {
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

  static getProducers(req: Request, res: Response): void {
    const db = database.getDatabase();

    db.all("SELECT * FROM producers LIMIT 10", (err, rows) => {
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

  static getMovieProducers(req: Request, res: Response): void {
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
      LIMIT 10
    `;

    db.all(query, (err, rows) => {
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
