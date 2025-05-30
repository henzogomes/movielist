export interface Movie {
  id: number;
  year: number;
  title: string;
  studios: string;
  winner: boolean;
}

export interface CsvRow {
  year: string;
  title: string;
  studios: string;
  producers: string;
  winner: string;
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
