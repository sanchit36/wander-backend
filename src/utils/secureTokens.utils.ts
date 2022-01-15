import User from '@/resources/user/user.interface';
import dayjs from 'dayjs';
import { Response } from 'express';
import { signJwt } from './jwt.utils';

export const generateAccessToken = async (user: User) => {
    return await signJwt(
        {
            userId: user._id,
            email: user.email,
        },
        process.env.ACCESS_TOKEN_SECRET!,
        {
            expiresIn: process.env.ACCESS_TOKEN_TTL,
        }
    );
};

export const generateRefreshToken = async (user: User) => {
    return await signJwt(
        {
            userId: user._id,
            email: user.email,
            tokenVersion: user.tokenVersion,
        },
        process.env.REFRESH_TOKEN_SECRET!,
        {
            expiresIn: process.env.REFRESH_TOKEN_TTL,
        }
    );
};

export const generateVerificationToken = async (user: User) => {
    return await signJwt(
        {
            userId: user._id,
            email: user.email,
        },
        process.env.VERIFY_TOKEN_SECRET!,
        {
            expiresIn: process.env.VERIFY_TOKEN_TTL,
        }
    );
};

export const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
    res.cookie('jid', refreshToken, {
        secure: process.env.NODE_ENV !== 'development',
        httpOnly: true,
        expires: dayjs().add(7, 'days').toDate(),
    });
};
