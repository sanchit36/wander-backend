export abstract class HttpException extends Error {
    readonly statusCode!: number;
    readonly name!: string;
    readonly description?: string;

    constructor(message: string | object, description?: string) {
        if (message instanceof Object) {
            super(JSON.stringify(message));
        } else {
            super(message);
        }
        this.name = this.constructor.name;
        this.description = description;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class HTTP400Error extends HttpException {
    readonly statusCode = 400;
    constructor(
        message: string | object = 'Bad Request',
        description?: string
    ) {
        super(message, description);
    }
}

export class HTTP401Error extends HttpException {
    readonly statusCode = 401;
    constructor(
        message: string | object = 'Unauthorized',
        description?: string
    ) {
        super(message, description);
    }
}

export class HTTP403Error extends HttpException {
    readonly statusCode = 403;
    constructor(message: string | object = 'Forbidden', description?: string) {
        super(message, description);
    }
}

export class HTTP404Error extends HttpException {
    readonly statusCode = 404;
    constructor(message: string | object = 'Not found', description?: string) {
        super(message, description);
    }
}

export class HTTP409Error extends HttpException {
    readonly statusCode = 409;
    constructor(message: string | object = 'Conflict', description?: string) {
        super(message, description);
    }
}
