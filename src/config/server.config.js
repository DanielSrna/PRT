/*------------------------------------------------*
* source: src/config/server.config.js
* descripción:
  Configuración del servidor, utilizando express.
  Aquí también se aplican los middlewares globales.
* autor: Daniel Felipe Serna López
* fecha: 04 - DIC - 2025
--------------------------------------------------*/

import express from 'express';

const app = express();

// Middlewares globales
app.use(express.json());

export default app;