/*------------------------------------------------*
* source: src/models/tokens/recoPassToken.model.js
* descripción:
  modelo de datos para los tokens de recuperación de contraseña.
* autor: Daniel Felipe Serna López
* fecha: 05 - DIC - 2025
--------------------------------------------------*/

import mongoose from 'mongoose';
import User from '../user.model.js';

const recoPassTokenSchema = new mongoose.Schema({
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

const RecoPassToken = mongoose.model('RecoPassToken', recoPassTokenSchema);

export default RecoPassToken;