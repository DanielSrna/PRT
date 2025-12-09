/*------------------------------------------------*
* source: src/services/crypto.service.js
* descripción:
  Servicio de encriptación y desencriptación de
  datos sensibles usando el módulo crypto de Node.js.
  Utiliza AES-256-GCM para cifrado seguro.
* autor: Daniel Felipe Serna López
* fecha: 09 - DIC - 2025
--------------------------------------------------*/

import crypto from 'crypto';
import logger from '../logs/logger.js';

// Algoritmo de encriptación
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // Para AES, esto es siempre 16
const AUTH_TAG_LENGTH = 16; // Tag de autenticación para GCM

/**
 * Encripta un texto usando AES-256-GCM
 * @param {string} text - Texto a encriptar
 * @returns {string} - Texto encriptado en formato: iv:authTag:encryptedData (en hexadecimal)
 */
export const encrypt = (text) => {
  try {
    logger.debug('encrypt: Iniciando encriptación de datos...');
    
    // Verificar que existe la clave de encriptación
    if (!process.env.ENCRYPTION_KEY) {
      throw new Error('ENCRYPTION_KEY no está definida en las variables de entorno');
    }

    // Generar un vector de inicialización aleatorio
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Crear el cifrador
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(process.env.ENCRYPTION_KEY, 'hex'),
      iv
    );

    // Encriptar el texto
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Obtener el tag de autenticación
    const authTag = cipher.getAuthTag();

    // Retornar en formato: iv:authTag:encryptedData
    const result = `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    
    logger.debug('encrypt: Datos encriptados correctamente');
    return result;
  } catch (error) {
    logger.error('encrypt: Error al encriptar datos', error);
    throw error;
  }
};

/**
 * Desencripta un texto encriptado con la función encrypt
 * @param {string} encryptedText - Texto encriptado en formato: iv:authTag:encryptedData
 * @returns {string} - Texto desencriptado
 */
export const decrypt = (encryptedText) => {
  try {
    logger.debug('decrypt: Iniciando desencriptación de datos...');
    
    // Verificar que existe la clave de encriptación
    if (!process.env.ENCRYPTION_KEY) {
      throw new Error('ENCRYPTION_KEY no está definida en las variables de entorno');
    }

    // Separar el iv, authTag y los datos encriptados
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Formato de datos encriptados inválido');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    // Crear el descifrador
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(process.env.ENCRYPTION_KEY, 'hex'),
      iv
    );

    // Establecer el tag de autenticación
    decipher.setAuthTag(authTag);

    // Desencriptar
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    logger.debug('decrypt: Datos desencriptados correctamente');
    return decrypted;
  } catch (error) {
    logger.error('decrypt: Error al desencriptar datos', error);
    throw error;
  }
};
