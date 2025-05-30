import { z } from "zod";

// schema to validate the CSV header
export const csvHeaderSchema = z.tuple([
  z.literal("year"),
  z.literal("title"),
  z.literal("studios"),
  z.literal("producers"),
  z.literal("winner"),
]);

// schema to validate each row of the CSV
export const csvRowSchema = z.object({
  year: z
    .string()
    .regex(/^\d{4}$/, "Year must be a 4-digit number")
    .transform(Number),
  title: z.string().min(1, "Title cannot be empty").trim(),
  studios: z.string().min(1, "Studios cannot be empty").trim(),
  producers: z.string().min(1, "Producers cannot be empty").trim(),
  winner: z
    .enum(["yes", ""], {
      errorMap: () => ({ message: "Winner must be 'yes' or empty" }),
    })
    .transform((val) => val === "yes"),
});

// infer types from the schemas
export type CsvRow = z.input<typeof csvRowSchema>;
export type ValidatedCsvRow = z.output<typeof csvRowSchema>;
export type CsvHeaders = z.infer<typeof csvHeaderSchema>;
