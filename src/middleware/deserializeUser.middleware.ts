import { NextFunction, Request, Response } from 'express';
import { get } from 'lodash';
import { verifyJwt } from '@/utils/jwt.utils';
import { HTTP403Error } from '@/utils/http/http.exception';

const deserializeUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const accessToken = (
        get(req, 'headers.authorization', '') as string
    ).replace(/^Bearer\s/, '');

    if (!accessToken) {
        return next();
    }

    const { decoded, expired } = await verifyJwt(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET!
    );

    if (expired) {
        return next();
    }

    if (decoded) {
        res.locals.user = decoded;
        return next();
    }

    return next();
};

export default deserializeUser;
