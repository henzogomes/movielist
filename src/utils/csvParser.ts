import fs from "fs";
import csv from "csv-parser";
import { database } from "../db/database";
import { CSV_FILE_PATH } from "../lib/constants";

interface CsvRow {
  year: string;
  title: string;
  studios: string;
  producers: string;
  winner: string;
}

export function loadCsvData(): Promise<void> {
  return new Promise((resolve, reject) => {
    const results: CsvRow[] = [];

    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csv({ separator: ";" }))
      .on("data", (data: CsvRow) => {
        results.push(data);
      })
      .on("end", () => {
        console.log(`CSV loaded: ${results.length} rows`);
        insertDataToDatabase(results);
        resolve();
      })
      .on("error", (error) => {
        console.error("Error reading CSV:", error);
        reject(error);
      });
  });
}

function insertDataToDatabase(data: CsvRow[]): void {
  const db = database.getDatabase();

  data.forEach((row) => {
    // csv fornecido vem com "yes" ou vazio
    const winner = row.winner === "yes" ? 1 : 0;

    db.run(
      "INSERT INTO movies (year, title, studios, winner) VALUES (?, ?, ?, ?)",
      [parseInt(row.year), row.title, row.studios, winner],
      function (err) {
        if (err) {
          console.error("Error inserting movie:", err);
          return;
        }

        const movieId = this.lastID;

        const producers = parseProducers(row.producers);
        producers.forEach((producerName) => {
          insertProducerAndRelation(db, producerName, movieId);
        });
      }
    );
  });

  console.log("Movies and producers inserted into database");
}

function parseProducers(producersString: string): string[] {
  // com base no csv fornecido, os produtores vem separados por virgula e and
  // tb dar trim nos espaços, filtrar nomes vazios
  return producersString
    .split(/,| and /)
    .map((name) => name.trim())
    .filter((name) => name.length > 0);
}

function insertProducerAndRelation(
  db: any,
  producerName: string,
  movieId: number
): void {
  // insere produtor, ignora se existir
  db.run(
    "INSERT OR IGNORE INTO producers (name) VALUES (?)",
    [producerName],
    function () {
      db.get(
        "SELECT id FROM producers WHERE name = ?",
        [producerName],
        (err: any, row: any) => {
          if (err) {
            console.error("Error finding producer:", err);
            return;
          }

          // insere o relacionamento filme produtor
          db.run(
            "INSERT INTO movie_producers (movie_id, producer_id) VALUES (?, ?)",
            [movieId, row.id],
            (err: any) => {
              if (err) {
                console.error("Error inserting movie-producer relation:", err);
              }
            }
          );
        }
      );
    }
  );
}
