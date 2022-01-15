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
import Mailer from '@/utils/Mailer.utils';
import {
    generateAccessToken,
    generateRefreshToken,
    generateVerificationToken,
    setRefreshTokenCookie,
} from '@/utils/secureTokens.utils';

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
            `${this.path}/verification-email`,
            this.getVerificationToken
        );
        this.router.get(
            `${this.path}/verify-email/:token`,
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
        this.router.get(`${this.path}/refresh-token`, this.refreshToken);
    }

    private createUser = async (
        req: Request<{}, {}, CreateUserInput['body']>,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        const responseHandler = new ResponseHandler(req, res);
        try {
            const user = await this.UserService.create(req.body);
            const verifyToken = await generateVerificationToken(user);
            const mailer = new Mailer();

            mailer.sendVerificationEmail(
                user.email,
                user.username,
                verifyToken
            );

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

            const accessToken = await generateAccessToken(user);
            const refreshToken = await generateRefreshToken(user);
            setRefreshTokenCookie(res, refreshToken);

            responseHandler
                .onFetch('User logged in successfully', {
                    user,
                    accessToken,
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

            const verifyToken = await generateVerificationToken(user);

            const mailer = new Mailer();

            mailer.sendVerificationEmail(
                user.email,
                user.username,
                verifyToken
            );

            responseHandler
                .onFetch('Verify Token', {
                    message: 'email as been sent to your email address',
                })
                .send();
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

    private refreshToken = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const responseHandler = new ResponseHandler(req, res);
        try {
            const token: string | undefined = req.cookies.jid;
            const { accessToken, refreshToken } =
                await this.UserService.refreshToken(token);
            setRefreshTokenCookie(res, refreshToken);
            responseHandler.onFetch('access Token', { accessToken }).send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };
}

export default UserController;
