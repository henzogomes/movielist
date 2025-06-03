/**
 * Integration tests for the Producer Intervals API using the original dataset.
 *
 * This test suite verifies the functionality of the `/api/producers/prize-intervals` endpoint
 * by testing against real data to ensure correct calculation of minimum and maximum intervals
 * between consecutive wins for movie producers.
 *
 * The tests cover:
 * - Response structure and data format validation
 * - Business logic validation for interval calculations
 * - Consistency of min/max interval logic
 * - Data accuracy against expected real-world results
 *
 * Test Structure:
 * - Uses cached data approach to minimize API calls during test execution
 * - Validates both data structure and business logic
 * - Includes specific assertions for known expected results from the original dataset
 *
 * Expected Results:
 * - Minimum interval: Joel Silver with 1 year (1990-1991)
 * - Maximum interval: Matthew Vaughn with 13 years (2002-2015)
 */

import { getHealthCheck, getProducerIntervals } from "../utils/testApiHelpers";
import { CSV_ORIGINAL } from "../../src/lib/constants";
import { ProducerIntervalResponse } from "../../src/types/producer.types";
import {
  validateResponseStructure,
  validateDataFormat,
  validateMinMaxConsistency,
  validateZeroIntervals,
  validateProducerList,
  validateHealthyResponse,
} from "../utils/testUtils";

describe("Producer Intervals API Integration Tests", () => {
  let cachedData: ProducerIntervalResponse;

  beforeAll(async () => {
    //fetch data once and cache it - using the constant directly
    cachedData = await getProducerIntervals(CSV_ORIGINAL);
  });

  describe("GET /api/producers/prize-intervals", () => {
    it("should return correct response structure and data format", async () => {
      const data = cachedData;

      validateResponseStructure(data);
      validateDataFormat(data);
    });

    it("should return consistent min/max interval logic", async () => {
      validateMinMaxConsistency(cachedData);
    });

    it("should handle zero-interval wins (same year) correctly", async () => {
      validateZeroIntervals(cachedData);
    });
  });

  describe("Data Accuracy Tests", () => {
    it("should return correct minimum and maximum intervals from real data", async () => {
      const { min, max } = cachedData;

      expect(min).toHaveLength(1);
      expect(min[0]).toEqual({
        producer: "Joel Silver",
        interval: 1,
        previousWin: 1990,
        followingWin: 1991,
      });

      expect(max).toHaveLength(1);
      expect(max[0]).toEqual({
        producer: "Matthew Vaughn",
        interval: 13,
        previousWin: 2002,
        followingWin: 2015,
      });
    });

    it("should only include producers with multiple wins", async () => {
      const expectedProducers = ["Joel Silver", "Matthew Vaughn"];
      validateProducerList(cachedData, expectedProducers);
    });
  });

  describe("Health Check Integration", () => {
    it("should confirm API is running", async () => {
      const body = await getHealthCheck();
      validateHealthyResponse(body);
    });
  });
});
