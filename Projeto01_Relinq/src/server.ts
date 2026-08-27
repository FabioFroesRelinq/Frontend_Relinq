import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testarConexao } from './config/db.js';
import funilRoutes from './routes/funilRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
// O express.json() OBRIGATORIAMENTE precisa vir antes das rotas
app.use(express.json()); 

app.use('/api', funilRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  await testarConexao();
});