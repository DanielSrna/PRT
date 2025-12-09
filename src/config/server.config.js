/*------------------------------------------------*
* source: src/config/server.config.js
* descripción:
  Configuración del servidor, utilizando express.
  Aquí también se aplican los middlewares globales.
* autor: Daniel Felipe Serna López
* fecha: 04 - DIC - 2025
--------------------------------------------------*/

import express from 'express';
import { errorHandler, notFoundHandler } from '../middleware/errorHandler.middleware.js';

const app = express();

// Middlewares globales
app.use(express.json());

// Aquí van tus rutas (agrégalas antes de los manejadores de error)
// app.use('/api/users', userRoutes);
// app.use('/api/auth', authRoutes);

// Manejadores de errores (SIEMPRE al final)
app.use(notFoundHandler);  // Captura rutas no encontradas (404)
app.use(errorHandler);     // Captura todos los demás errores

export default app;