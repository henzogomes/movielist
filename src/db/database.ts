import sqlite3 from "sqlite3";

export class Database {
  private db: sqlite3.Database;
  private isInitialized: boolean = false;

  constructor() {
    this.db = new sqlite3.Database(":memory:", (err: Error | null) => {
      if (err) {
        throw new Error(`Failed to connect to database: ${err.message}`);
      } else {
        this.initializeTables();
      }
    });
  }

  private initializeTables(): void {
    const tables = [
      {
        name: "movies",
        sql: `
          CREATE TABLE movies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            year INTEGER NOT NULL,
            title TEXT NOT NULL,
            studios TEXT NOT NULL,
            winner BOOLEAN NOT NULL DEFAULT 0
          )
        `,
      },
      {
        name: "producers",
        sql: `
          CREATE TABLE producers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
          )
        `,
      },
      {
        name: "movie_producers",
        sql: `
          CREATE TABLE movie_producers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            movie_id INTEGER NOT NULL,
            producer_id INTEGER NOT NULL,
            FOREIGN KEY (movie_id) REFERENCES movies (id),
            FOREIGN KEY (producer_id) REFERENCES producers (id)
          )
        `,
      },
    ];

    let tablesCreated = 0;
    const totalTables = tables.length;

    tables.forEach((table) => {
      this.db.run(table.sql, (err: Error | null) => {
        if (err) {
          throw new Error(
            `Failed to create ${table.name} table: ${err.message}`
          );
        }

        tablesCreated++;
        if (tablesCreated === totalTables) {
          this.isInitialized = true;
        }
      });
    });
  }

  getDatabase(): sqlite3.Database {
    return this.db;
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err: Error | null) => {
        if (err) {
          reject(new Error(`Failed to close database: ${err.message}`));
        } else {
          resolve();
        }
      });
    });
  }
}

export const database = new Database();
