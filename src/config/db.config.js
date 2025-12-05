/*------------------------------------------------*
* source: src/config/db.config.js
* descripción:
  Configuración de la base de datos, utilizando
  mongoose para conectarse a una base de datos de
  mongoDB Atlas. Se extraen las variables de entorno
  necesarias para la conexión.
* autor: Daniel Felipe Serna López
* fecha: 04 - DIC - 2025
--------------------------------------------------*/

import mongoose from 'mongoose';
import logger from '../logs/logger.js';

const connectDB = async () => {
    try {
        logger.debug('Iniciando conexión a la base de datos MongoDB...');
        const conn = await mongoose.connect(process.env.MONGO_URI);
        logger.info(`MongoDB Conectado: ${conn.connection.host}`);
    } catch (error) {
        logger.error(`Error: ${error.message}`);
    }
};

export default connectDB;