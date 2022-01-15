import { Schema, model } from 'mongoose';
import Token from './token.interface';

const tokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 7200,
    },
});

export default model<Token>('Token', tokenSchema);
