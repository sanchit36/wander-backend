import { NextFunction, Request, Response, Router } from 'express';

import Controller from '@/utils/interfaces/controller.interface';
import UserService from '@/resources/user/user.service';
import ResponseHandler from '@/utils/http/http.response';

class UserController implements Controller {
    public path = '/users';
    public router = Router();
    private UserService = new UserService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post(`${this.path}/signup`, this.createUser);
    }

    private createUser = async (
        req: Request,
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
}

export default UserController;
