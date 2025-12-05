/*------------------------------------------------*
* source: src/models/tokens/refreshToken.model.js
* descripción:
  modelo de datos para los tokens de refresco.
* autor: Daniel Felipe Serna López
* fecha: 05 - DIC - 2025
--------------------------------------------------*/

import mongoose from 'mongoose';
import User from '../user.model.js';

const refreshTokenSchema = new mongoose.Schema({
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
    device: {
        type: String,
    },
}, {
    timestamps: true,
});

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

export default RefreshToken;