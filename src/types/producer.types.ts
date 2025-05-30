import { ValidatedCsvRow } from "../schemas/csvSchema";

export interface Movie {
  id: number;
  year: number;
  title: string;
  studios: string;
  winner: boolean;
}

export interface ProducerInterval {
  producer: string;
  interval: number;
  previousWin: number;
  followingWin: number;
}

export interface ProducerIntervalResponse {
  min: ProducerInterval[];
  max: ProducerInterval[];
}

export interface ProducerWinData {
  producer: string;
  year: number;
}

export interface CsvValidationResult {
  isValid: boolean;
  errors: string[];
  rowsProcessed: number;
  rowsSkipped: number;
  validRows: ValidatedCsvRow[];
}
