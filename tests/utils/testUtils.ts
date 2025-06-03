/**
 * Test utility functions for validating API responses and data structures.
 * These functions can be reused across different test files to avoid code duplication.
 */

import {
  ProducerInterval,
  ProducerIntervalResponse,
} from "../../src/types/producer.types";

interface HealthResponse {
  message: string;
  status: string;
  database: string;
  currentTime?: string;
}

export function validateResponseStructure(
  data: ProducerIntervalResponse,
  expectMinLength: boolean = false
): void {
  // response structure
  expect(data).toHaveProperty("min");
  expect(data).toHaveProperty("max");
  expect(Array.isArray(data.min)).toBe(true);
  expect(Array.isArray(data.max)).toBe(true);

  if (expectMinLength) {
    expect(data.min.length).toBeGreaterThan(0);
  }
}

export function validateDataFormat(data: ProducerIntervalResponse): void {
  // data format validation
  const allIntervals: ProducerInterval[] = [...data.min, ...data.max];

  allIntervals.forEach((interval: ProducerInterval) => {
    // check if properties exist
    expect(interval).toHaveProperty("producer");
    expect(interval).toHaveProperty("interval");
    expect(interval).toHaveProperty("previousWin");
    expect(interval).toHaveProperty("followingWin");

    // check if types are correct
    expect(typeof interval.producer).toBe("string");
    expect(typeof interval.interval).toBe("number");
    expect(typeof interval.previousWin).toBe("number");
    expect(typeof interval.followingWin).toBe("number");

    // business logic validation
    expect(interval.interval).toBeGreaterThanOrEqual(0);
    expect(interval.followingWin).toBeGreaterThanOrEqual(interval.previousWin);
    expect(interval.interval).toBe(
      interval.followingWin - interval.previousWin
    );
  });
}

export function validateMinMaxConsistency(
  data: ProducerIntervalResponse
): void {
  const { min, max } = data;

  if (min.length > 0 && max.length > 0) {
    const minInterval = min[0].interval;
    const maxInterval = max[0].interval;

    // all min intervals should have the same value
    min.forEach((interval: ProducerInterval) => {
      expect(interval.interval).toBe(minInterval);
    });

    // all max intervals should have the same value
    max.forEach((interval: ProducerInterval) => {
      expect(interval.interval).toBe(maxInterval);
    });

    // min should be <= max
    expect(minInterval).toBeLessThanOrEqual(maxInterval);
  }
}

export function validateZeroIntervals(
  data: ProducerIntervalResponse
): ProducerInterval[] {
  const { min, max } = data;
  const allIntervals: ProducerInterval[] = [...min, ...max];

  const zeroIntervals: ProducerInterval[] = allIntervals.filter(
    (interval: ProducerInterval) => interval.interval === 0
  );

  zeroIntervals.forEach((interval: ProducerInterval) => {
    expect(interval.previousWin).toBe(interval.followingWin);
    expect(interval.producer).toBeDefined();
    expect(typeof interval.producer).toBe("string");
  });

  return zeroIntervals;
}

export function validateProducerList(
  data: ProducerIntervalResponse,
  expectedProducers?: string[]
): string[] {
  const { min, max } = data;
  const allIntervals: ProducerInterval[] = [...min, ...max];
  const uniqueProducers: string[] = [
    ...new Set(
      allIntervals.map((interval: ProducerInterval) => interval.producer)
    ),
  ];

  // verify each producer appears in the results (they have multiple wins)
  uniqueProducers.forEach((producer: string) => {
    expect(producer).toBeDefined();
    expect(typeof producer).toBe("string");
    expect(producer.length).toBeGreaterThan(0);
  });

  // if specific producers are expected, validate them
  if (expectedProducers) {
    uniqueProducers.forEach((producer: string) => {
      expect(expectedProducers).toContain(producer);
    });
  }

  return uniqueProducers;
}

export function validateHealthResponse(body: HealthResponse): void {
  expect(body).toHaveProperty("message");
  expect(body).toHaveProperty("status");
  expect(body).toHaveProperty("database");

  expect(typeof body.message).toBe("string");
  expect(typeof body.status).toBe("string");
  expect(typeof body.database).toBe("string");
}

export function validateHealthyResponse(body: HealthResponse): void {
  validateHealthResponse(body);

  expect(body).toHaveProperty("currentTime");
  expect(body.message).toContain("API is healthy");
  expect(body.status).toBe("ready");
  expect(body.database).toBe("SQLite in-memory database connected");
  expect(typeof body.currentTime).toBe("string");
}

export function validateNotReadyResponse(body: HealthResponse): void {
  validateHealthResponse(body);

  expect(body.message).toContain("Database not ready");
  expect(body.status).toBe("initializing");
  expect(body.database).toBe("SQLite in-memory database initializing");
  expect(body).not.toHaveProperty("currentTime");
}
