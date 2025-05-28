import express from 'express';
import cors from 'cors';

// Inicializa a aplicação Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rota Hello World
app.get('/', (req, res) => {
  res.json({ message: 'Hello World! Movie List API is running.' });
});

export default app;