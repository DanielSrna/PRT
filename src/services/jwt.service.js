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
import { encrypt, decrypt } from './crypto.service.js';

/*------------------Generación de tokens------------------*/

// Generar access token
export const generateAccessToken = (userId) => {
  logger.debug('generateAccessToken: Generando Access Token...');
  const accessToken = jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION });
  logger.info('generateAccessToken: Access Token generado, se retorna el token');
  return accessToken;
};

// Generar refresh token, y reemplazarlo/crearlo en la base de datos
export const generateRefreshToken = async (userId, deviceInfo) => {
  logger.debug('generateRefreshToken: Generando Refresh Token...');
  const refreshToken = jwt.sign({ userId, deviceInfo }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION });

  try {
    logger.debug('generateRefreshToken: Refresh Token generado, encriptando y guardando en la base de datos...');
    const encryptedToken = encrypt(refreshToken);
    await RefreshToken.findOneAndUpdate(
      { userId, device: deviceInfo },
      { token: encryptedToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      { upsert: true, new: true }
    );
  } catch (error) {
    logger.error('generateRefreshToken: Error al guardar Refresh Token en la base de datos', error);
    throw error;
  }

  logger.info('generateRefreshToken: Refresh Token guardado en la base de datos, se retorna el token');
  return refreshToken;
};

// Generar token de verificación de correo electrónico, y reempazarlo/crearlo en la base de datos
export const generateVerifyEmailToken = async (email) => {
  logger.debug('generateVerifyEmailToken: Generando Verify Email Token...');
  const verifyEmailToken = jwt.sign({ email }, process.env.JWT_VERIFY_EMAIL_SECRET, { expiresIn: process.env.VERIFY_EMAIL_TOKEN_EXPIRATION });

  try {
    logger.debug('generateVerifyEmailToken: Verify Email Token generado, encriptando y guardando en la base de datos...');
    const encryptedToken = encrypt(verifyEmailToken);
    await VerifyEmailToken.findOneAndUpdate(
      { email },
      { token: encryptedToken, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
      { upsert: true, new: true }
    );
  } catch (error) {
    logger.error('generateVerifyEmailToken: Error al guardar Verify Email Token en la base de datos', error);
    throw error;
  }

  logger.info('generateVerifyEmailToken: Verify Email Token guardado en la base de datos, se retorna el token');
  return verifyEmailToken;
};

// Generar token de recuperación de contraseña, y reemplazarlo/crearlo en la base de datos
export const generateRecoPassToken = async (email) => {
  logger.debug('generateRecoPassToken: Generando Reco Pass Token...');
  const recoPassToken = jwt.sign({ email }, process.env.JWT_RECO_PASS_SECRET, { expiresIn: process.env.RECO_PASS_TOKEN_EXPIRATION });

  try {
    logger.debug('generateRecoPassToken: Reco Pass Token generado, encriptando y guardando en la base de datos...');
    const encryptedToken = encrypt(recoPassToken);
    await RecoPassToken.findOneAndUpdate(
      { email },
      { token: encryptedToken, expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000) },
      { upsert: true, new: true }
    );
  } catch (error) {
    logger.error('generateRecoPassToken: Error al guardar Reco Pass Token en la base de datos', error);
    throw error;
  }

  logger.info('generateRecoPassToken: Reco Pass Token guardado en la base de datos, se retorna el token');
  return recoPassToken;
};

/*------------------Verificación de tokens------------------*/

// Verificar access token, buscando el usuario en la base de datos
export const verifyAccessToken = async (token) => {
  logger.debug('verifyAccessToken: Verificando Access Token...');
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    logger.debug('verifyAccessToken: Buscando usuario en la base de datos...');
    const user = await User.findById(decoded.userId);

    if (!user) { throw new Error('Usuario no encontrado para el Access Token proporcionado') }

    logger.info('verifyAccessToken: Access Token verificado correctamente, se retorna el usuario');
    return user;
  } catch (error) {
    logger.error('verifyAccessToken: Error al verificar Access Token', error);
    throw error;
  }
};

// Verificar refresh token buscando el token en la base de datos
export const verifyRefreshToken = async (token, deviceInfo) => {
  logger.debug('verifyRefreshToken: Verificando Refresh Token...');
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    logger.debug('verifyRefreshToken: Buscando Refresh Token en la base de datos...');
    const storedTokenDoc = await RefreshToken.findOne({ userId: decoded.userId, device: deviceInfo });

    if (!storedTokenDoc) { throw new Error('Refresh Token no encontrado o inválido') }

    // Desencriptar el token almacenado y comparar
    logger.debug('verifyRefreshToken: Refresh token encontrado, desencriptando y comparando el Refresh Token almacenado...');
    const decryptedToken = decrypt(storedTokenDoc.token);
    if (decryptedToken !== token) { throw new Error('Refresh Token no coincide') }

    logger.info('verifyRefreshToken: Refresh Token verificado correctamente, se retorna el userId');
    return decoded.userId;
  } catch (error) {
    logger.error('verifyRefreshToken: Error al verificar Refresh Token', error);
    throw error;
  }
};

// Verificar token de verificación de correo electrónico buscando el token en la base de datos
export const verifyVerifyEmailToken = async (token) => {
  logger.debug('verifyVerifyEmailToken: Verificando Verify Email Token...');
  try {
    const decoded = jwt.verify(token, process.env.JWT_VERIFY_EMAIL_SECRET);
    logger.debug('verifyVerifyEmailToken: Buscando Verify Email Token en la base de datos...');
    const storedTokenDoc = await VerifyEmailToken.findOne({ email: decoded.email });

    if (!storedTokenDoc) { throw new Error('Verify Email Token no encontrado o inválido') }

    // Desencriptar el token almacenado y comparar
    logger.debug('verifyVerifyEmailToken: Verify Email token encontrado, desencriptando y comparando el Verify Email Token almacenado...');
    const decryptedToken = decrypt(storedTokenDoc.token);
    if (decryptedToken !== token) { throw new Error('Verify Email Token no coincide') }

    logger.info('verifyVerifyEmailToken: Verify Email Token verificado correctamente, se retorna el email');
    return decoded.email;
  } catch (error) {
    logger.error('verifyVerifyEmailToken: Error al verificar Verify Email Token', error);
    throw error;
  }
};

// Verificar token de recuperación de contraseña buscando el token en la base de datos
export const verifyRecoPassToken = async (token) => {
  logger.debug('verifyRecoPassToken: Verificando Reco Pass Token...');
  try {
    const decoded = jwt.verify(token, process.env.JWT_RECO_PASS_SECRET);
    logger.debug('verifyRecoPassToken: Buscando Reco Pass Token en la base de datos...');
    const storedTokenDoc = await RecoPassToken.findOne({ email: decoded.email });

    if (!storedTokenDoc) { throw new Error('Reco Pass Token no encontrado o inválido') }

    // Desencriptar el token almacenado y comparar
    logger.debug('verifyRecoPassToken: Reco Pass token encontrado, desencriptando y comparando el Reco Pass Token almacenado...');
    const decryptedToken = decrypt(storedTokenDoc.token);
    if (decryptedToken !== token) { throw new Error('Reco Pass Token no coincide') }

    logger.info('verifyRecoPassToken: Reco Pass Token verificado correctamente, se retorna el email');
    return decoded.email;
  } catch (error) {
    logger.error('verifyRecoPassToken: Error al verificar Reco Pass Token', error);
    throw error;
  }
};

/*------------------Eliminar tokens------------------*/

// Eliminar refresh token de la base de datos
export const deleteRefreshToken = async (userId, deviceInfo) => {
  logger.debug('deleteRefreshToken: Eliminando Refresh Token de la base de datos...');
  try {
    await RefreshToken.findOneAndDelete({ userId, device: deviceInfo });
    logger.info('deleteRefreshToken: Refresh Token eliminado correctamente');
  } catch (error) {
    logger.error('deleteRefreshToken: Error al eliminar Refresh Token', error);
    throw error;
  }
};

// Eliminar todos los refresh tokens de un usuario (cerrar sesión en todos los dispositivos)
export const deleteAllRefreshTokens = async (userId) => {
  logger.debug('deleteAllRefreshTokens: Eliminando todos los Refresh Tokens del usuario...');
  try {
    await RefreshToken.deleteMany({ userId });
    logger.info('deleteAllRefreshTokens: Todos los Refresh Tokens del usuario eliminados correctamente');
  } catch (error) {
    logger.error('deleteAllRefreshTokens: Error al eliminar Refresh Tokens', error);
    throw error;
  }
};

// Eliminar verify email token de la base de datos
export const deleteVerifyEmailToken = async (email) => {
  logger.debug('deleteVerifyEmailToken: Eliminando Verify Email Token de la base de datos...');
  try {
    await VerifyEmailToken.findOneAndDelete({ email });
    logger.info('deleteVerifyEmailToken: Verify Email Token eliminado correctamente');
  } catch (error) {
    logger.error('deleteVerifyEmailToken: Error al eliminar Verify Email Token', error);
    throw error;
  }
};

// Eliminar reco pass token de la base de datos
export const deleteRecoPassToken = async (email) => {
  logger.debug('deleteRecoPassToken: Eliminando Reco Pass Token de la base de datos...');
  try {
    await RecoPassToken.findOneAndDelete({ email });
    logger.info('deleteRecoPassToken: Reco Pass Token eliminado correctamente');
  } catch (error) {
    logger.error('deleteRecoPassToken: Error al eliminar Reco Pass Token', error);
    throw error;
  }
};

// Limpiar tokens expirados de la base de datos
export const cleanExpiredTokens = async () => {
  logger.debug('cleanExpiredTokens: Limpiando tokens expirados de la base de datos...');
  try {
    const now = new Date();
    const results = await Promise.all([
      RefreshToken.deleteMany({ expiresAt: { $lt: now } }),
      VerifyEmailToken.deleteMany({ expiresAt: { $lt: now } }),
      RecoPassToken.deleteMany({ expiresAt: { $lt: now } })
    ]);
    
    const totalDeleted = results.reduce((sum, result) => sum + result.deletedCount, 0);
    logger.info(`cleanExpiredTokens: ${totalDeleted} tokens expirados eliminados correctamente`);
    return totalDeleted;
  } catch (error) {
    logger.error('cleanExpiredTokens: Error al limpiar tokens expirados', error);
    throw error;
  }
};