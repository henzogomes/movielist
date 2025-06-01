/**
 * Integration tests for the Producer Intervals API using an invalid CSV dataset.
 *
 * This test suite verifies that the application properly handles and rejects invalid CSV data
 * during startup/initialization. It tests the CSV validation pipeline and ensures
 * that corrupted or malformed data prevents the app from starting.
 *
 */

import { createApp } from "../../src/createApp";
import { CSV_INVALID } from "../../src/lib/constants";

describe("Invalid CSV Integration Tests", () => {
  describe("CSV Validation Failure", () => {
    it("should fail to create app with invalid CSV data and provide detailed error", async () => {
      try {
        await createApp(CSV_INVALID);
        fail(
          "Expected app creation to fail with invalid CSV, but it succeeded"
        );
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toBeDefined();
        expect(error.message).toContain("CSV validation failed");
        expect(typeof error.message).toBe("string");
        expect(error.message.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Error Message Content Validation", () => {
    it("should provide complete validation failure message and error count", async () => {
      try {
        await createApp(CSV_INVALID);
        fail("Expected app creation to fail with complete error message");
      } catch (error: any) {
        expect(error.message).toBeDefined();
        expect(error.message).toContain("CSV validation failed");
        expect(error.message).toContain("Found 2 validation errors");
        expect(error.message).toContain("No data was imported");
      }
    });
  });

  describe("Console Output Validation", () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, "log").mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it("should log detailed validation report to console", async () => {
      try {
        await createApp(CSV_INVALID);
        fail("Expected app creation to fail");
      } catch (error: any) {
        expect(error.message).toContain("CSV validation failed");

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining("CSV Validation Report")
        );

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining("Rows processed: 206")
        );

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining("Valid rows: 205")
        );

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining("Invalid rows: 1")
        );

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining("Total errors: 2")
        );

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining("Row 1: year - Year must be a 4-digit number")
        );

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining(
            "Row 1: winner - Winner must be 'yes' or empty"
          )
        );
      }
    });
  });
});
