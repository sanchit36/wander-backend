import { NextFunction, Request, Response, Router } from 'express';

import Controller from '@/utils/interfaces/controller.interface';
import UserService from '@/resources/user/user.service';
import ResponseHandler from '@/utils/http/http.response';
import {
    CreateUserInput,
    createUserSchema,
    LoginUserInput,
    loginUserSchema,
} from '@/resources/user/user.schema';
import validate from '@/middleware/validateResource.middleware';

class UserController implements Controller {
    public path = '/users';
    public router = Router();
    private UserService = new UserService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post(
            `${this.path}/signup`,
            validate(createUserSchema),
            this.createUser
        );
        this.router.post(
            `${this.path}/login`,
            validate(loginUserSchema),
            this.loginUser
        );
    }

    private createUser = async (
        req: Request<{}, {}, CreateUserInput['body']>,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        const responseHandler = new ResponseHandler(req, res);
        try {
            const body = req.body;
            const user = await this.UserService.create(body);
            responseHandler.onCreate('User created successfully', user).send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };

    private loginUser = async (
        req: Request<{}, {}, LoginUserInput['body']>,
        res: Response,
        next: NextFunction
    ) => {
        const responseHandler = new ResponseHandler(req, res);
        try {
            const body = req.body;
            const user = await this.UserService.login(body);
            responseHandler.onFetch('User logged in successfully', user).send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };
}

export default UserController;
