import sqlite3 from "sqlite3";
import { database } from "../db/database";
import { ValidatedCsvRow } from "../schemas/csvSchema";

export class MovieService {
  private static getDb(): sqlite3.Database {
    return database.getDatabase();
  }

  static async insertMoviesFromCsv(data: ValidatedCsvRow[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const db = this.getDb();
      let completed = 0;
      const total = data.length;

      if (total === 0) {
        resolve();
        return;
      }

      data.forEach((row) => {
        db.run(
          "INSERT INTO movies (year, title, studios, winner) VALUES (?, ?, ?, ?)",
          [row.year, row.title, row.studios, row.winner ? 1 : 0],
          function (err) {
            if (err) {
              console.error("Error inserting movie:", err);
              reject(err);
              return;
            }

            const movieId = this.lastID;
            const producers = MovieService.parseProducers(row.producers);

            MovieService.insertProducersForMovie(producers, movieId)
              .then(() => {
                completed++;
                if (completed === total) {
                  console.log("Movies and producers inserted into database");
                  resolve();
                }
              })
              .catch(reject);
          }
        );
      });
    });
  }

  private static parseProducers(producersString: string): string[] {
    // the provided csv has producers separated by "," and "and"
    // also trim spaces and filter empty names
    return producersString
      .split(/,| and /)
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
  }

  private static async insertProducersForMovie(
    producers: string[],
    movieId: number
  ): Promise<void> {
    // loop over each producer and insert into the database
    const promises = producers.map((producerName) =>
      this.insertProducerAndRelation(producerName, movieId)
    );

    await Promise.all(promises);
  }

  private static insertProducerAndRelation(
    producerName: string,
    movieId: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const db = this.getDb();
      // insert the producer, ignore if exists
      db.run(
        "INSERT OR IGNORE INTO producers (name) VALUES (?)",
        [producerName],
        function () {
          // Get producer ID
          db.get(
            "SELECT id FROM producers WHERE name = ?",
            [producerName],
            (err: any, row: any) => {
              if (err) {
                console.error("Error finding producer:", err);
                reject(err);
                return;
              }

              // insert movie-producer relationship
              db.run(
                "INSERT INTO movie_producers (movie_id, producer_id) VALUES (?, ?)",
                [movieId, row.id],
                (err: any) => {
                  if (err) {
                    console.error(
                      "Error inserting movie-producer relation:",
                      err
                    );
                    reject(err);
                    return;
                  }
                  resolve();
                }
              );
            }
          );
        }
      );
    });
  }
}
