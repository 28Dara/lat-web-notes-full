import dotenv from 'dotenv';
dotenv.config();

// NUEVO: módulo interno de Node para controlar cómo se resuelven los nombres de dominio.
import dns from 'node:dns';

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import noteRoutes from './routes/notes.js';
import authRoutes from './routes/auth.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

// NUEVO: Node consultará primero a Google (8.8.8.8) y Cloudflare (1.1.1.1)
// en vez de al DNS de tu router o proveedor, que rechazó la consulta SRV.
// Va ANTES de mongoose.connect, porque ahí es donde se hace la consulta.
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: { status: 'ok' },
    error: null,
  });
});

app.use(noteRoutes);
app.use(authRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URI!, { maxPoolSize: 10 })
  .then(() => {
    console.log('Conectado a MongoDB');
    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en el puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error de conexión', err);
    process.exit(1);
  });
