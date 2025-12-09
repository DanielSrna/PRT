/*------------------------------------------------*
* source: src/middleware/validators/users/register.validator.js
* descripción:
  validador para el registro de usuarios, asegurando
  que los datos proporcionados cumplen con los
  requisitos necesarios antes de ser procesados.
* autor: Daniel Felipe Serna López
* fecha: 09 - DIC - 2025
--------------------------------------------------*/

import { body } from 'express-validator';


export const registerValidator = [
  body('username')
    .trim()
    .notEmpty().withMessage('El nombre de usuario es obligatorio')
    .isLength({ min: 3, max: 30 }).withMessage('El nombre de usuario debe tener entre 3 y 30 caracteres')
    .matches(/^[A-Za-z0-9_-]+$/).withMessage('El nombre de usuario solo puede contener letras, números, guiones y guiones bajos')
    .custom((value) => {
      const reservedNames = ['admin', 'root', 'system', 'null', 'undefined'];
      if (reservedNames.includes(value.toLowerCase())) {
        throw new Error('Este nombre de usuario está reservado');
      }
      return true;
    }),
  
  body('email')
    .trim()
    .notEmpty().withMessage('El correo electrónico es obligatorio')
    .isEmail().withMessage('El correo electrónico no es válido')
    .isLength({ max: 100 }).withMessage('El correo electrónico es demasiado largo')
    .normalizeEmail()
    .custom((value) => {
      // Validar dominios desechables comunes
      const disposableDomains = ['tempmail.com', 'throwaway.email', '10minutemail.com', 'guerrillamail.com'];
      const domain = value.split('@')[1];
      if (disposableDomains.includes(domain)) {
        throw new Error('No se permiten correos desechables');
      }
      return true;
    }),
  
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 8, max: 128 }).withMessage('La contraseña debe tener entre 8 y 128 caracteres')
    .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una letra minúscula')
    .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una letra mayúscula')
    .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número')
    .matches(/[@$!%*?&]/).withMessage('La contraseña debe contener al menos un carácter especial (@, $, !, %, *, ?, &)')
    .custom((value) => {
      // Evitar contraseñas comunes
      const commonPasswords = ['password', 'Password1!', '12345678', 'Qwerty123!'];
      if (commonPasswords.includes(value)) {
        throw new Error('Esta contraseña es demasiado común');
      }
      return true;
    }),

  body('confirmPassword')
    .notEmpty().withMessage('Debe confirmar la contraseña')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
];