import { NextFunction, Request, Response, Router } from 'express';

import Controller from '@/utils/interfaces/controller.interface';
import UserService from '@/resources/user/user.service';
import ResponseHandler from '@/utils/http/http.response';
import {
    CreateUserInput,
    createUserSchema,
    LoginUserInput,
    loginUserSchema,
    VerifyUserInput,
    verifyUserSchema,
} from '@/resources/user/user.schema';
import validate from '@/middleware/validateResource.middleware';
import { signJwt, verifyJwt } from '@/utils/jwt.utils';
import { HTTP400Error } from '@/utils/http/http.exception';
import requireUser from '@/middleware/requireUser.middleware';

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
        this.router.post(
            `${this.path}/get-verify-token`,

            this.getVerificationToken
        );
        this.router.patch(
            `${this.path}/verify-user/:token`,
            validate(verifyUserSchema),
            this.verifyUserEmail
        );

        this.router.get(
            `${this.path}/private`,
            requireUser,
            (req: Request, res: Response) => {
                res.sendStatus(200);
            }
        );
    }

    private createUser = async (
        req: Request<{}, {}, CreateUserInput['body']>,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        const responseHandler = new ResponseHandler(req, res);
        try {
            await this.UserService.create(req.body);
            responseHandler
                .onCreate(
                    'Account created successfully, Verify your email to login'
                )
                .send();
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
            const user = await this.UserService.login(req.body);

            const accessToken = await signJwt(
                {
                    userId: user._id,
                    email: user.email,
                },
                process.env.ACCESS_TOKEN_SECRET!,
                {
                    expiresIn: process.env.ACCESS_TOKEN_TTL,
                }
            );
            const refreshToken = await signJwt(
                {
                    userId: user._id,
                    email: user.email,
                    verifyToken: user.verifyToken,
                },
                process.env.ACCESS_TOKEN_SECRET!,
                {
                    expiresIn: process.env.ACCESS_TOKEN_TTL,
                }
            );

            responseHandler
                .onFetch('User logged in successfully', {
                    user,
                    accessToken,
                    refreshToken,
                })
                .send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };

    private getVerificationToken = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const responseHandler = new ResponseHandler(req, res);
        try {
            const { email } = req.body;
            const user = await this.UserService.findUserByEmail(email);

            if (user.isVerified) {
                throw new HTTP400Error('Already verified');
            }

            const verifyToken = await signJwt(
                {
                    userId: user._id,
                    email: user.email,
                },
                process.env.VERIFY_TOKEN_SECRET!,
                {
                    expiresIn: process.env.VERIFY_TOKEN_TTL,
                }
            );

            responseHandler.onFetch('Verify Token', verifyToken).send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };

    private verifyUserEmail = async (
        req: Request<VerifyUserInput['params']>,
        res: Response,
        next: NextFunction
    ) => {
        const responseHandler = new ResponseHandler(req, res);
        try {
            const { token } = req.params;
            const { decoded } = await verifyJwt(
                token,
                process.env.VERIFY_TOKEN_SECRET!
            );

            if (!decoded) {
                throw new HTTP400Error('Invalid token');
            }

            const user = await this.UserService.findUserByEmail(decoded.email);
            user.isVerified = true;
            user.save();
            responseHandler.onFetch('User Verified Successfully').send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };
}

export default UserController;
