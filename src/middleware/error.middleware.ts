import { Request, Response, NextFunction } from 'express';
import { HttpException } from '@/utils/http/http.exception';
import ResponseHandler from '@/utils/http/http.response';
import { ZodError } from 'zod';

function errorMiddleware(
    error: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    const responseHandler = new ResponseHandler(req, res);

    if (error instanceof ZodError) {
        let errors: { [key: string]: string } = {};
        error.errors.forEach((error) => {
            errors[error.path[error.path.length - 1]] = error.message;
        });

        return responseHandler
            .onClientError(
                422,
                error.name,
                'Invalid request',
                'Invalid request body, params or query',
                errors
            )
            .send();
    }

    if (error instanceof HttpException) {
        return responseHandler
            .onClientError(
                error.statusCode,
                error.name,
                error.message,
                error.description,
                error.errors
            )
            .send();
    }
    return responseHandler.onServerError(error.name, error.message).send();
}

export default errorMiddleware;
