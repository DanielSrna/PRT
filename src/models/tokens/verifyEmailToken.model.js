/*------------------------------------------------*
* source: src/models/tokens/verifyEmailToken.model.js
* descripción:
  modelo de datos para los tokens de verificación de correo electrónico.
* autor: Daniel Felipe Serna López
* fecha: 05 - DIC - 2025
--------------------------------------------------*/

import mongoose from 'mongoose';
import User from '../user.model.js';

const verifyEmailTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
}, {
    timestamps: true,
});

const VerifyEmailToken = mongoose.model('VerifyEmailToken', verifyEmailTokenSchema);

export default VerifyEmailToken;