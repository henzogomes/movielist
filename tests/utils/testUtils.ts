/**
 * Test utility functions for validating API responses and data structures.
 * These functions can be reused across different test files to avoid code duplication.
 */

export function validateResponseStructure(data: any, expectMinLength = false) {
  // response structure
  expect(data).toHaveProperty("min");
  expect(data).toHaveProperty("max");
  expect(Array.isArray(data.min)).toBe(true);
  expect(Array.isArray(data.max)).toBe(true);

  if (expectMinLength) {
    expect(data.min.length).toBeGreaterThan(0);
  }
}

export function validateDataFormat(data: any) {
  // data format validation
  const allIntervals = [...data.min, ...data.max];
  allIntervals.forEach((interval: any) => {
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

export function validateMinMaxConsistency(data: any) {
  const { min, max } = data;

  if (min.length > 0 && max.length > 0) {
    const minInterval = min[0].interval;
    const maxInterval = max[0].interval;

    // all min intervals should have the same value
    min.forEach((interval: any) => {
      expect(interval.interval).toBe(minInterval);
    });

    // all max intervals should have the same value
    max.forEach((interval: any) => {
      expect(interval.interval).toBe(maxInterval);
    });

    // min should be <= max
    expect(minInterval).toBeLessThanOrEqual(maxInterval);
  }
}

export function validateZeroIntervals(data: any) {
  const { min, max } = data;
  const allIntervals = [...min, ...max];

  const zeroIntervals = allIntervals.filter(
    (interval: any) => interval.interval === 0
  );

  zeroIntervals.forEach((interval: any) => {
    expect(interval.previousWin).toBe(interval.followingWin);
    expect(interval.producer).toBeDefined();
    expect(typeof interval.producer).toBe("string");
  });

  return zeroIntervals;
}

export function validateProducerList(data: any, expectedProducers?: string[]) {
  const { min, max } = data;
  const allIntervals = [...min, ...max];
  const uniqueProducers = [
    ...new Set(allIntervals.map((i: any) => i.producer)),
  ];

  // verify each producer appears in the results (they have multiple wins)
  uniqueProducers.forEach((producer) => {
    expect(producer).toBeDefined();
    expect(typeof producer).toBe("string");
    expect(producer.length).toBeGreaterThan(0);
  });

  // if specific producers are expected, validate them
  if (expectedProducers) {
    uniqueProducers.forEach((producer) => {
      expect(expectedProducers).toContain(producer);
    });
  }

  return uniqueProducers;
}
