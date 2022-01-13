import { Request, Response, NextFunction } from 'express';
import { HttpException } from '@/utils/exceptions/http.exception';
import ResponseHandler from '@/utils/response/http.response';

function errorMiddleware(
    error: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    const responseHandler = new ResponseHandler(req, res);
    console.log(error);

    if (error instanceof HttpException) {
        responseHandler
            .onClientError(
                error.statusCode,
                error.name,
                error.message,
                error.description
            )
            .send();
    } else {
        responseHandler.onServerError(error.name, error.message).send();
    }
}

export default errorMiddleware;
