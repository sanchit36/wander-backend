import { Request, Response, NextFunction } from 'express';
import { HTTP404Error } from '@/utils/http/http.exception';
import ResponseHandler from '@/utils/http/http.response';

function notFoundMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction
): void {
    next(new HTTP404Error(`Can't ${req.method} - ${req.path}`));
}

export default notFoundMiddleware;
