import { Request, Response } from 'express';
import { HttpResponse } from '@/utils/interfaces/httpResponse.interface';
import {
    HTTP400Error,
    HTTP401Error,
    HTTP403Error,
    HTTP404Error,
    HTTP409Error,
} from '@/utils/http/http.exception';
import { JsonWebTokenError } from 'jsonwebtoken';

class ResponseHandler implements HttpResponse {
    status = 1;
    statusCode = 200;
    error?: string;
    message = 'Success';
    description?: string;
    payload?: any;
    errors?: object;

    constructor(private req: Request, private res: Response) {}

    public setData(message: string, payload?: any, description?: string) {
        this.message = message || 'successful';
        this.description = description || undefined;
        this.payload = payload || undefined;
        this.error = undefined;
    }

    public setErrorData(
        error: string,
        message: string,
        description?: string,
        errors?: object
    ) {
        this.message = message;
        this.description = description;
        this.error = error;
        this.payload = undefined;
        this.errors = errors;
    }

    onCreate(message: string, payload?: any, description?: string) {
        this.statusCode = 201;
        this.status = 1;
        this.setData(message, payload, description);
        return this;
    }

    onFetch(message: string, payload?: any, description?: string) {
        this.statusCode = 200;
        this.status = 1;
        this.setData(message, payload, description);
        return this;
    }

    onClientError(
        statusCode: number,
        error: string,
        message: string,
        description?: string,
        errors?: object
    ) {
        this.statusCode = statusCode || 400;
        this.status = 0;
        this.setErrorData(error, message, description, errors);
        return this;
    }

    onServerError(error: string, message: string, description?: string) {
        this.statusCode = 500;
        this.status = 0;
        this.setErrorData(error, message, description);
        return this;
    }

    send(): void {
        const response: HttpResponse = {
            status: this.status,
            error: this.error,
            statusCode: this.statusCode,
            message: this.message,
            description: this.description,
            payload: this.payload,
            errors: this.errors,
        };
        this.res.status(this.statusCode).json(response);
    }

    sendError(e: any) {
        console.log(e);
        if (e instanceof HTTP400Error) {
            return new HTTP400Error(e.message, e.description);
        }
        if (e instanceof HTTP401Error) {
            return new HTTP401Error(e.message, e.description);
        }
        if (e instanceof HTTP403Error) {
            return new HTTP403Error(e.message, e.description);
        }
        if (e instanceof HTTP404Error) {
            return new HTTP404Error(e.message, e.description);
        }
        if (e instanceof HTTP409Error) {
            return new HTTP409Error(e.message, e.description);
        }
        if (e.name === 'ValidationError') {
            let errors: { [key: string]: string } = {};

            Object.keys(e.errors).forEach((key) => {
                errors[key] = e.errors[key].message;
            });

            return new HTTP400Error('Schema validation error', '', errors);
        }

        if (e.code === 11000) {
            let errors: { [key: string]: string } = {};
            Object.keys(e.keyValue).forEach((key) => {
                errors[key] = `${key} is already in the taken`;
            });

            return new HTTP400Error('Duplicate key error', '', errors);
        }

        if (e instanceof JsonWebTokenError) {
            return new HTTP403Error('Forbidden');
        }

        if (e.name === 'MongoError') {
            return new HTTP400Error(e.message, 'Schema validation error.');
        }

        return e;
    }
}

export default ResponseHandler;
