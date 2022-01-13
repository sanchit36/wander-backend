import { HTTP403Error } from '@/utils/http/http.exception';
import { NextFunction, Request, Response } from 'express';

const requireUser = (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;

    if (!user) {
        throw new HTTP403Error('Please login');
    }

    return next();
};

export default requireUser;
