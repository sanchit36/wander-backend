import jwt from 'jsonwebtoken';
import PayloadJwt from './interfaces/payload.interface';

export const signJwt = async (
    payload: PayloadJwt,
    secretKey: jwt.Secret,
    options?: jwt.SignOptions
) => {
    try {
        const token = jwt.sign(payload, secretKey, options);
        return token;
    } catch (error) {
        throw error;
    }
};

export const verifyJwt = async (token: string, secretKey: string) => {
    try {
        const decoded = jwt.verify(token, secretKey) as PayloadJwt;
        return {
            valid: true,
            expired: false,
            decoded,
        };
    } catch (error: any) {
        return {
            valid: false,
            expired: error.message === 'jwt expired',
            decoded: null,
        };
    }
};
