/*------------------------------------------------*
* source: src/services/jwt.service.js
* descripción:
  Administración de JSON Web Tokens (JWT) para
  autenticación y autorización. Se incluyen
  funciones para generar y verificar tokens,
  utilizando una clave secreta almacenada en
  las variables de entorno.
* autor: Daniel Felipe Serna López
* fecha: 04 - DIC - 2025
--------------------------------------------------*/

import jwt from 'jsonwebtoken';
import logger from '../logs/logger.js';
import User from '../models/user.model.js';
import RefreshToken from '../models/tokens/refreshToken.model.js';
import RecoPassToken from '../models/tokens/recoPassToken.model.js';
import VerifyEmailToken from '../models/tokens/verifyEmailToken.model.js';

/*------------------Generación de tokens------------------*/

// Generar access token
export const generateAccessToken = (payload) => {
  logger.debug('generateAccessToken: Generando Access Token...');
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION });
  logger.info('generateAccessToken: Access Token generado, se retorna el token');
  return accessToken;
};

// Generar refresh token, y reemplazarlo/crearlo en la base de datos
export const generateRefreshToken = async (userId, deviceInfo) => {
  logger.debug('generateRefreshToken: Generando Refresh Token...');
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION });

  // Guardar o actualizar el token en la base de datos
  logger.debug('generateRefreshToken: Guardando Refresh Token en la base de datos...');
  await RefreshToken.findOneAndUpdate(
    { userId, device: deviceInfo },
    { token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    { upsert: true, new: true }
  );

  logger.info('generateRefreshToken: Refresh Token guardado en la base de datos, se retorna el token');
  return refreshToken;
};

// Generar token de verificación de correo electrónico, y reempazarlo/crearlo en la base de datos
export const generateVerifyEmailToken = async (userId) => {
  logger.debug('generateVerifyEmailToken: Generando Verify Email Token...');
  const verifyEmailToken = jwt.sign({ userId }, process.env.JWT_VERIFY_EMAIL_SECRET, { expiresIn: process.env.VERIFY_EMAIL_TOKEN_EXPIRATION });

  logger.info('generateVerifyEmailToken: Verify Email Token generado, guardando en la base de datos...');
  // Guardar o actualizar el token en la base de datos
  await VerifyEmailToken.findOneAndUpdate(
    { userId },
    { token: verifyEmailToken, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    { upsert: true, new: true }
  );

  logger.info('generateVerifyEmailToken: Verify Email Token guardado en la base de datos, se retorna el token');
  return verifyEmailToken;
};

// Generar token de recuperación de contraseña, y reemplazarlo/crearlo en la base de datos
export const generateRecoPassToken = async (userId) => {
  logger.debug('generateRecoPassToken: Generando Reco Pass Token...');
  const recoPassToken = jwt.sign({ userId }, process.env.JWT_RECO_PASS_SECRET, { expiresIn: process.env.RECO_PASS_TOKEN_EXPIRATION });

  logger.info('generateRecoPassToken: Reco Pass Token generado, guardando en la base de datos...');
  // Guardar o actualizar el token en la base de datos
  await RecoPassToken.findOneAndUpdate(
    { userId },
    { token: recoPassToken, expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000) },
    { upsert: true, new: true }
  );

  logger.info('generateRecoPassToken: Reco Pass Token guardado en la base de datos, se retorna el token');
  return recoPassToken;
};