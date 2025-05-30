import fs from "fs";
import csv from "csv-parser";
import { CSV_FILE_PATH } from "../lib/constants";
import { csvHeaderSchema, csvRowSchema } from "../schemas/csvSchema";
import { CsvValidationResult } from "../types/producer.types";
import { MovieService } from "../services/movieService";

export function loadCsvData(): Promise<void> {
  return new Promise((resolve, reject) => {
    // check if the csv file exists
    if (!fs.existsSync(CSV_FILE_PATH)) {
      reject(new Error(`CSV file not found: ${CSV_FILE_PATH}`));
      return;
    }

    const validationResult: CsvValidationResult = {
      isValid: true,
      errors: [],
      rowsProcessed: 0,
      rowsSkipped: 0,
      validRows: [],
    };

    let headersValidated = false;
    const allRows: any[] = [];

    // start reading the cvs file
    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csv({ separator: ";" }))
      .on("headers", (headers: string[]) => {
        // validate headers with zod schema
        const headerValidation = csvHeaderSchema.safeParse(headers);
        if (!headerValidation.success) {
          validationResult.isValid = false;
          validationResult.errors.push(
            `Invalid CSV headers. Expected: year;title;studios;producers;winner. Got: ${headers.join(
              ";"
            )}`
          );
          return;
        }
        headersValidated = true;
        console.log("CSV headers validated successfully");
      })
      .on("data", (data: any) => {
        if (!headersValidated) return;

        // get all rows first, dont validate yet
        allRows.push(data);
      })
      .on("end", async () => {
        // Stop if headers are invalid
        if (!headersValidated || !validationResult.isValid) {
          reject(
            new Error(
              `Invalid CSV format: ${validationResult.errors.join(", ")}`
            )
          );
          return;
        }

        // validate all rows and collect all errors
        allRows.forEach((data, index) => {
          validationResult.rowsProcessed++;
          const rowNumber = index + 1;

          // validate row with zod schema
          const rowValidation = csvRowSchema.safeParse(data);

          if (!rowValidation.success) {
            validationResult.isValid = false;
            validationResult.rowsSkipped++;

            const errorMessages = rowValidation.error.errors.map(
              (err) =>
                `Row ${rowNumber}: ${err.path.join(".")} - ${err.message}`
            );
            validationResult.errors.push(...errorMessages);
          } else {
            // valid row, push to validated data
            validationResult.validRows.push(rowValidation.data);
          }
        });

        // generate the report
        generateValidationReport(validationResult);

        // reject the promise if there are validation errors
        if (!validationResult.isValid || validationResult.errors.length > 0) {
          reject(
            new Error(
              `CSV validation failed. Found ${validationResult.errors.length} validation errors. No data was imported. \n\n`
            )
          );
          return;
        }

        if (validationResult.validRows.length === 0) {
          reject(new Error("No valid data found in CSV file"));
          return;
        }

        // Only insert if all rows are valid
        console.log(
          "\nAll data is valid. Proceeding with database insertion..."
        );

        try {
          // insert data
          await MovieService.insertMoviesFromCsv(validationResult.validRows);
          console.log("CSV data loaded and validated successfully");
          resolve();
        } catch (error) {
          console.error("Error inserting data to database:", error);
          reject(error);
        }
      })
      .on("error", (error) => {
        console.error("Error reading CSV:", error);
        reject(error);
      });
  });
}

function generateValidationReport(validationResult: CsvValidationResult): void {
  console.log(`\nCSV Validation Report:`);
  console.log(`======================`);
  console.log(`Rows processed: ${validationResult.rowsProcessed}`);
  console.log(`Valid rows: ${validationResult.validRows.length}`);
  console.log(`Invalid rows: ${validationResult.rowsSkipped}`);
  console.log(`Total errors: ${validationResult.errors.length}`);

  if (validationResult.errors.length > 0) {
    console.log(`\nDetailed Error Report:`);
    console.log(`=====================`);
    validationResult.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
}
