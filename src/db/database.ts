import sqlite3 from 'sqlite3';

export class Database {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(':memory:', (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to SQLite in-memory database');
        this.initializeTables();
      }
    });
  }

  private initializeTables(): void {
    this.db.run(`
      CREATE TABLE movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year INTEGER NOT NULL,
        title TEXT NOT NULL,
        studios TEXT NOT NULL,
        winner BOOLEAN NOT NULL DEFAULT 0
      )
    `);

    this.db.run(`
      CREATE TABLE producers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      )
    `);

    this.db.run(`
      CREATE TABLE movie_producers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        movie_id INTEGER NOT NULL,
        producer_id INTEGER NOT NULL,
        FOREIGN KEY (movie_id) REFERENCES movies (id),
        FOREIGN KEY (producer_id) REFERENCES producers (id)
      )
    `);

    console.log('Database tables created successfully');
  }

  getDatabase(): sqlite3.Database {
    return this.db;
  }

  close(): void {
    this.db.close();
  }
}

export const database = new Database();