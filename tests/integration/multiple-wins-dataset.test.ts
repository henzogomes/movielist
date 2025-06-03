/**
 * Integration tests for the Producer Intervals API using multiple wins dataset.
 *
 * This test suite verifies the functionality of the `/api/producers/prize-intervals` endpoint
 * specifically for scenarios where producers win multiple awards in the same year, resulting
 * in zero-interval wins.
 *
 * Expected Results for multiple-wins dataset:
 * - Minimum interval: 0 years (3 producers with multiple wins)
 * - Maximum interval: 13 years (2 producers with 13-year intervals)
 * - Multiple producers in both min and max categories
 */

import { getHealthCheck, getProducerIntervals } from "../utils/testApiHelpers";
import { CSV_MULTIPLE_WINS } from "../../src/lib/constants";
import { ProducerIntervalResponse } from "../../src/types/producer.types";
import {
  validateResponseStructure,
  validateDataFormat,
  validateMinMaxConsistency,
  validateZeroIntervals,
  validateProducerList,
  validateHealthyResponse,
} from "../utils/testUtils";

describe("Multiple Wins Integration Tests", () => {
  let cachedData: ProducerIntervalResponse;

  beforeAll(async () => {
    cachedData = await getProducerIntervals(CSV_MULTIPLE_WINS);
  });

  describe("GET /api/producers/prize-intervals with multiple wins", () => {
    it("should return correct response structure with zero intervals", async () => {
      const data = cachedData;

      validateResponseStructure(data, true);
      validateDataFormat(data);
    });

    it("should handle multiple producers with zero intervals", async () => {
      const { min } = cachedData;

      expect(min[0].interval).toBe(0);
      expect(min).toHaveLength(3);

      min.forEach((interval) => {
        expect(interval.interval).toBe(0);
        expect(interval.previousWin).toBe(interval.followingWin);
        expect(interval.producer).toBeDefined();
        expect(typeof interval.producer).toBe("string");
      });

      const expectedMinProducers = [
        "temp producer",
        "temp producer 2",
        "temp producer 3",
      ];
      const actualMinProducers = min.map((interval) => interval.producer);

      expectedMinProducers.forEach((producer) => {
        expect(actualMinProducers).toContain(producer);
      });
    });

    it("should handle multiple producers with same maximum interval", async () => {
      const { max } = cachedData;

      // should have exactly 2 producers with maximum interval of 13 years
      expect(max).toHaveLength(2);

      const maxInterval = max[0].interval;
      expect(maxInterval).toBe(13);

      //max intervals should be 13 years
      max.forEach((interval) => {
        expect(interval.interval).toBe(13);
        expect(interval.producer).toBeDefined();
        expect(typeof interval.producer).toBe("string");
        expect(interval.interval).toBe(
          interval.followingWin - interval.previousWin
        );
      });

      const expectedMaxProducers = [
        "Matthew Vaughn",
        "producer with 13 year interval wins",
      ];

      const actualMaxProducers = max.map((interval) => interval.producer);

      expectedMaxProducers.forEach((producer) => {
        expect(actualMaxProducers).toContain(producer);
      });
    });

    it("should return specific expected minimum interval data", async () => {
      const { min } = cachedData;

      expect(min).toHaveLength(3);

      const expectedMinResults = [
        {
          producer: "temp producer",
          interval: 0,
          previousWin: 1980,
          followingWin: 1980,
        },
        {
          producer: "temp producer 2",
          interval: 0,
          previousWin: 1980,
          followingWin: 1980,
        },
        {
          producer: "temp producer 3",
          interval: 0,
          previousWin: 1980,
          followingWin: 1980,
        },
      ];

      expectedMinResults.forEach((expectedInterval) => {
        const actualInterval = min.find(
          (interval) => interval.producer === expectedInterval.producer
        );

        expect(actualInterval).toEqual(expectedInterval);
      });
    });

    it("should return specific expected maximum interval data", async () => {
      const { max } = cachedData;

      expect(max).toHaveLength(2);

      const expectedMaxResults = [
        {
          producer: "Matthew Vaughn",
          interval: 13,
          previousWin: 2002,
          followingWin: 2015,
        },
        {
          producer: "producer with 13 year interval wins",
          interval: 13,
          previousWin: 2010,
          followingWin: 2023,
        },
      ];

      expectedMaxResults.forEach((expectedInterval) => {
        const actualInterval = max.find(
          (interval) => interval.producer === expectedInterval.producer
        );

        expect(actualInterval).toEqual(expectedInterval);
      });
    });

    it("should return consistent min/max interval logic with multiple entries", async () => {
      const { min, max } = cachedData;

      validateMinMaxConsistency(cachedData);

      const minInterval = min[0].interval;
      const maxInterval = max[0].interval;

      // min intervals should be 0 for multiple wins dataset
      expect(minInterval).toBe(0);
      min.forEach((interval) => {
        expect(interval.interval).toBe(0);
      });

      // max intervals should be 13 for this dataset
      expect(maxInterval).toBe(13);
      max.forEach((interval) => {
        expect(interval.interval).toBe(13);
      });

      // min should be less than max (0 < 13)
      expect(minInterval).toBeLessThan(maxInterval);
    });

    it("should properly calculate intervals for same-year multiple wins", async () => {
      const zeroIntervals = validateZeroIntervals(cachedData);

      // should have 3 zero intervals (all the min intervals)
      expect(zeroIntervals.length).toBe(3);

      zeroIntervals.forEach((interval) => {
        expect(interval.interval).toBe(0);
        expect(interval.previousWin).toBe(1980);
        expect(interval.followingWin).toBe(1980);
      });
    });

    it("should include all expected producers with multiple wins", async () => {
      const expectedAllProducers = [
        "temp producer",
        "temp producer 2",
        "temp producer 3",
        "Matthew Vaughn",
        "producer with 13 year interval wins",
      ];

      const uniqueProducers = validateProducerList(
        cachedData,
        expectedAllProducers
      );

      //5 unique producers total
      expect(uniqueProducers.length).toBe(5);
    });

    it("should handle edge case of same year wins correctly", async () => {
      const { min } = cachedData;

      expect(min).toHaveLength(3);

      min.forEach((interval) => {
        expect(interval.interval).toBe(0);

        expect(interval.interval).toBe(
          interval.followingWin - interval.previousWin
        );

        // for same year wins: previousWin === followingWin (1980)
        expect(interval.previousWin).toBe(interval.followingWin);
        expect(interval.previousWin).toBe(1980);
        expect(interval.followingWin).toBe(1980);
        expect(interval.producer).toBeDefined();
        expect(typeof interval.producer).toBe("string");
        expect(interval.producer.trim()).not.toBe("");
      });
    });
  });

  describe("Health Check Integration", () => {
    it("should confirm API is running with multiple wins dataset", async () => {
      const body = await getHealthCheck();
      validateHealthyResponse(body);
    });
  });
});
