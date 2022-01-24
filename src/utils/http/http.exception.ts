export abstract class HttpException extends Error {
    readonly statusCode!: number;
    readonly name!: string;
    readonly errors?: object;
    readonly description?: string;

    constructor(
        message: string | object,
        description?: string,
        errors?: object
    ) {
        if (message instanceof Object) {
            super(JSON.stringify(message));
        } else {
            super(message);
        }
        this.name = this.constructor.name;
        this.description = description;
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class HTTP400Error extends HttpException {
    readonly statusCode = 400;
    constructor(
        message: string | object = 'Bad Request',
        description?: string,
        errors?: object
    ) {
        super(message, description, errors);
    }
}

export class HTTP401Error extends HttpException {
    readonly statusCode = 401;
    constructor(
        message: string | object = 'Unauthorized',
        description?: string,
        errors?: object
    ) {
        super(message, description, errors);
    }
}

export class HTTP403Error extends HttpException {
    readonly statusCode = 403;

    constructor(
        message: string | object = 'Forbidden',
        description?: string,
        errors?: object
    ) {
        super(message, description, errors);
    }
}

export class HTTP404Error extends HttpException {
    readonly statusCode = 404;
    constructor(
        message: string | object = 'Not found',
        description?: string,
        errors?: object
    ) {
        super(message, description, errors);
    }
}

export class HTTP409Error extends HttpException {
    readonly statusCode = 409;
    constructor(
        message: string | object = 'Conflict',
        description?: string,
        errors?: object
    ) {
        super(message, description, errors);
    }
}

export class HTTP422Error extends HttpException {
    readonly statusCode = 422;
    constructor(
        message: string | object = 'Unprocessable Entity',
        description?: string,
        errors?: object
    ) {
        super(message, description, errors);
    }
}
