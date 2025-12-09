/*------------------------------------------------*
* source: src/middleware/errorHandler.middleware.js
* descripción:
  Middleware global para el manejo centralizado de
  errores. Diferencia entre errores operacionales
  (esperados) y errores de programación (bugs).
  En producción oculta detalles sensibles.
* autor: Daniel Felipe Serna López
* fecha: 09 - DIC - 2025
--------------------------------------------------*/

import logger from '../logs/logger.js';

/**
 * Clase para errores operacionales predecibles
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware para manejar errores de forma centralizada
 */
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log completo del error (siempre en logs)
  logger.error('Error capturado por errorHandler', {
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Respuesta según el entorno
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    // En desarrollo: mostrar todo
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
      details: {
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
      }
    });
  }

  // En producción: diferenciar entre errores operacionales y de programación
  if (err.isOperational) {
    // Error operacional confiable: enviar mensaje al cliente
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  // Error de programación o desconocido: no filtrar detalles al cliente
  return res.status(500).json({
    status: 'error',
    message: 'Ocurrió un error interno en el servidor'
  });
};

/**
 * Middleware para manejar rutas no encontradas (404)
 */
export const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `No se encontró la ruta ${req.method} ${req.originalUrl}`,
    404
  );
  next(error);
};

/**
 * Manejador para errores no capturados
 */
export const setupUncaughtExceptionHandlers = () => {
  // Excepciones no capturadas (errores síncronos)
  process.on('uncaughtException', (err) => {
    logger.fatal('UNCAUGHT EXCEPTION! 💥 Apagando el servidor...', {
      error: err.message,
      stack: err.stack
    });
    
    // Dar tiempo para que se escriban los logs y cerrar
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  // Promesas rechazadas sin capturar (errores asíncronos)
  process.on('unhandledRejection', (reason, promise) => {
    logger.fatal('UNHANDLED REJECTION! 💥 Apagando el servidor...', {
      reason,
      promise
    });
    
    // Dar tiempo para que se escriban los logs y cerrar
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });
};
