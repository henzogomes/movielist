import express from "express";
import cors from "cors";
import { database } from "./db/database";
import { loadCsvData } from "./utils/csvParser";

const app = express();

app.use(cors());
app.use(express.json());

// carrega csv na inicialização do servidor
loadCsvData().catch(console.error);

app.get("/", (req, res) => {
  res.json({ message: "Hello World! Movie List API is running." });
});

app.get("/health", (req, res) => {
  const db = database.getDatabase();

  db.get("SELECT datetime('now') as current_time", (err, row: any) => {
    if (err) {
      res.status(500).json({
        message: "Database connection failed",
        error: err.message,
      });
    } else {
      res.json({
        message: "API is healthy",
        database: "SQLite in-memory database connected",
        currentTime: row.current_time,
      });
    }
  });
});

app.get("/movies", (req, res) => {
  const db = database.getDatabase();

  db.all("SELECT * FROM movies LIMIT 10", (err, rows) => {
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
});

app.get("/producers", (req, res) => {
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
});

app.get("/movie-producers", (req, res) => {
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
});

// endpoint principal - retorna os intervalos minimos e máximos
app.get("/api/producers/prize-intervals", (req, res) => {
  const db = database.getDatabase();

  const query = `
    SELECT
      p.name as producer,
      m.year
    FROM producers p
    JOIN movie_producers mp ON p.id = mp.producer_id
    JOIN movies m ON mp.movie_id = m.id
    WHERE m.winner = 1
    ORDER BY p.name, m.year
  `;

  db.all(query, (err, rows: any[]) => {
    if (err) {
      res.status(500).json({
        message: "Error fetching producer intervals",
        error: err.message,
      });
      return;
    }

    const intervals = calculateProducerIntervals(rows);

    res.json(intervals);
  });
});

function calculateProducerIntervals(data: any[]): any {
  // agrupando anos por produtor
  const producerWins: { [key: string]: number[] } = {};

  data.forEach((row) => {
    if (!producerWins[row.producer]) {
      producerWins[row.producer] = [];
    }
    producerWins[row.producer].push(row.year);
  });

  //calculando intervalos para produtores com mais de uma vitoria
  const allIntervals: any[] = [];

  Object.keys(producerWins).forEach((producer) => {
    const years = producerWins[producer].sort((a, b) => a - b);

    if (years.length > 1) {
      for (let i = 1; i < years.length; i++) {
        const interval = years[i] - years[i - 1];
        allIntervals.push({
          producer,
          interval,
          previousWin: years[i - 1],
          followingWin: years[i],
        });
      }
    }
  });

  if (allIntervals.length === 0) {
    return { min: [], max: [] };
  }

  // encontrando os intervalos min e max
  const minInterval = Math.min(...allIntervals.map((i) => i.interval));
  const maxInterval = Math.max(...allIntervals.map((i) => i.interval));

  const min = allIntervals.filter((i) => i.interval === minInterval);
  const max = allIntervals.filter((i) => i.interval === maxInterval);

  return { min, max };
}

export default app;
