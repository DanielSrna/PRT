/*------------------------------------------------*
* source: src/server.js
* descripción:
  Punto de entrada del servidor. Aquí se cargan las
  configuraciones necesarias, se conecta a la base
  de datos y se inicia el servidor en el puerto
  especificado en las variables de entorno. También,
  se especifican las rutas principales de la API.
* autor: Daniel Felipe Serna López
* fecha: 04 - DIC - 2025
--------------------------------------------------*/

import dotenv from 'dotenv';
dotenv.config();

import app from './config/server.config.js';
import connectDB from './config/db.config.js';
import logger from './logs/logger.js';

// Conectar a la base de datos
connectDB().then(() => {
    // Iniciar el servidor
    const PORT = process.env.PORT || 3000;
    logger.debug('Iniciando el servidor...');
    app.listen(PORT, () => {
        logger.info(`Servidor corriendo en el puerto ${PORT} en modo ${process.env.NODE_ENV}`);
    });
}).catch(error => {
    logger.error(`No se pudo iniciar el servidor: ${error.message}`);
});