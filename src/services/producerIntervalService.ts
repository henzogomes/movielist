import sqlite3 from "sqlite3";
import { database } from "../db/database";
import {
  ProducerWinData,
  ProducerInterval,
  ProducerIntervalResponse,
} from "../types/producer.types";

export class ProducerIntervalService {
  private static getDb(): sqlite3.Database {
    return database.getDatabase();
  }

  static async getProducerIntervals(): Promise<ProducerIntervalResponse> {
    return new Promise((resolve, reject) => {
      const db = this.getDb();

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

      db.all(query, (err, rows: ProducerWinData[]) => {
        if (err) {
          reject(err);
          return;
        }

        const intervals = this.calculateProducerIntervals(rows);
        resolve(intervals);
      });
    });
  }

  private static calculateProducerIntervals(
    data: ProducerWinData[]
  ): ProducerIntervalResponse {
    //group years by producer
    const producerWins: { [key: string]: number[] } = {};

    data.forEach((row) => {
      if (!producerWins[row.producer]) {
        producerWins[row.producer] = [];
      }
      producerWins[row.producer].push(row.year);
    });

    // calculate intervals for producers with more than one win
    const allIntervals: ProducerInterval[] = [];

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

    // find min and max intervals
    const minInterval = Math.min(...allIntervals.map((i) => i.interval));
    const maxInterval = Math.max(...allIntervals.map((i) => i.interval));

    const min = allIntervals.filter((i) => i.interval === minInterval);
    const max = allIntervals.filter((i) => i.interval === maxInterval);

    return { min, max };
  }
}
