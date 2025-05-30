import express from "express";
import cors from "cors";
import { loadCsvData } from "./utils/csvParser";
import routes from "./routes";

const app = express();

app.use(cors());
app.use(express.json());

// load the csv data into the in-memory database at application startup
loadCsvData().catch(console.error);

// routes
app.use(routes);

export default app;
