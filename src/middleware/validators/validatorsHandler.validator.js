/*------------------------------------------------*
* source: src/middleware/validators/validatorsHandler.validator.js
* descripción:
  Middleware para el manejo de validadores, atrapando
  errores y formateándolos para una respuesta
  consistente en la API.  
* autor: Daniel Felipe Serna López
* fecha: 09 - DIC - 2025
--------------------------------------------------*/

import { validationResult } from 'express-validator';
import logger from '../../logs/logger.js';


export const validatorsHandler = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Agrupar errores por campo para evitar duplicados
    const errorsByField = {};
    errors.array().forEach(err => {
      if (!errorsByField[err.path]) {
        errorsByField[err.path] = [];
      }
      errorsByField[err.path].push(err.msg);
    });

    // Formatear errores agrupados
    const formattedErrors = Object.entries(errorsByField).map(([field, messages]) => ({
      field,
      messages
    }));

    // Log de errores de validación
    logger.warn(`Errores de validación en ${req.method} ${req.path}`, {
      errors: formattedErrors,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    return res.status(400).json({
      status: 'error',
      message: 'Errores de validación en los datos proporcionados',
      errors: formattedErrors
    });
  }
  
  next();
};