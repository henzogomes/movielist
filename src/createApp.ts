import express from "express";
import cors from "cors";
import { loadCsvData } from "./utils/csvParser";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export async function createApp(
  csvFilePath?: string
): Promise<express.Application> {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // load dataset
  await loadCsvData(csvFilePath);
  console.log(`App created with CSV: ${csvFilePath || "default"}`);

  // routes
  app.use(routes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
