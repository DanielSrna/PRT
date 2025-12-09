/*------------------------------------------------*
* source: src/services/tokenRotation.service.js
* descripción:
  Servicio de rotación de tokens para mejorar la
  seguridad de la autenticación en la aplicación.
* autor: Daniel Felipe Serna López
* fecha: 09 - DIC - 2025
--------------------------------------------------*/

import {
    generateAccessToken, 
    generateRefreshToken,  
    verifyRefreshToken
} from './jwt.service.js';
import logger from '../logs/logger.js';

/**
 * Rotar tokens de acceso y refresco
 * @param {string} oldRefreshToken - Token de refresco antiguo
 * @param {string} deviceInfo - Información del dispositivo
 * @returns {Promise<{accessToken: string, refreshToken: string}>}
 */
export const rotateTokens = async (oldRefreshToken, deviceInfo) => {
    try {
        logger.debug('rotateTokens: Iniciando rotación de tokens...');

        // Verificar el token de refresco antiguo
        logger.debug('rotateTokens: Verificando token de refresco antiguo...');
        const userId = await verifyRefreshToken(oldRefreshToken, deviceInfo);

        // Generar nuevos tokens (el refresh token se reemplaza automáticamente en la BD)
        logger.debug('rotateTokens: Generando nuevos tokens...');
        const newAccessToken = generateAccessToken(userId);
        const newRefreshToken = await generateRefreshToken(userId, deviceInfo);

        logger.info('rotateTokens: Tokens rotados correctamente, retornandolos');
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        };
    } catch (error) {
        logger.error('rotateTokens: Error al rotar tokens', error);
        throw error;
    }
};