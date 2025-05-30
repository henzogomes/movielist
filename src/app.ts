import express from "express";
import cors from "cors";
import { loadCsvData } from "./utils/csvParser";
import routes from "./routes";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Carregar dados do CSV na inicialização
loadCsvData().catch(console.error);

// Usar todas as rotas organizadas
app.use(routes);

export default app;
