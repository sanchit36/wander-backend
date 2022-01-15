import { NextFunction, Request, Response, Router } from 'express';
import crypto from 'crypto';

import Controller from '@/utils/interfaces/controller.interface';
import UserService from '@/resources/user/user.service';
import ResponseHandler from '@/utils/http/http.response';
import {
    CreateUserInput,
    createUserSchema,
    emailBody,
    EmailBody,
    LoginUserInput,
    loginUserSchema,
    resetPassword,
    ResetPasswordInput,
    VerifyUserInput,
    verifyUserSchema,
} from '@/resources/user/user.schema';
import validate from '@/middleware/validateResource.middleware';
import { HTTP400Error, HTTP401Error } from '@/utils/http/http.exception';
import Mailer from '@/utils/Mailer.utils';
import {
    generateAccessToken,
    generateRefreshToken,
    setRefreshTokenCookie,
} from '@/utils/secureTokens.utils';
import TokenService from '@/resources/token/token.service';

class UserController implements Controller {
    public path = '/users';
    public router = Router();
    private userService = new UserService();
    private tokenService = new TokenService();

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
            `${this.path}/verify-email`,
            validate(emailBody),
            this.getVerificationEmail
        );
        this.router.patch(
            `${this.path}/verify-email/:userId/:token`,
            validate(verifyUserSchema),
            this.verifyUserEmail
        );
        this.router.post(
            `${this.path}/reset-password`,
            validate(emailBody),
            this.resetPasswordEmail
        );
        this.router.patch(
            `${this.path}/reset-password/:userId/:token`,
            validate(resetPassword),
            this.resetPassword
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
            const user = await this.userService.create(req.body);
            const token = await this.tokenService.create({
                userId: user._id,
                token: crypto.randomBytes(32).toString('hex'),
            });
            const mailer = new Mailer();
            mailer.sendVerificationEmail(user, token.token);
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
            const user = await this.userService.login(req.body);

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

    private getVerificationEmail = async (
        req: Request<{}, {}, EmailBody['body']>,
        res: Response,
        next: NextFunction
    ) => {
        const responseHandler = new ResponseHandler(req, res);
        try {
            const { email } = req.body;
            const user = await this.userService.findUserByEmail(email);
            if (user.isVerified) {
                throw new HTTP400Error('Already verified');
            }
            let token = await this.tokenService.findToken({ userId: user._id });
            if (!token) {
                token = await this.tokenService.create({
                    userId: user._id,
                    token: crypto.randomBytes(32).toString('hex'),
                });
            }
            const mailer = new Mailer();
            mailer.sendVerificationEmail(user, token.token);
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
            const { userId, token } = req.params;
            const t = await this.tokenService.findToken({ userId, token });
            if (!t) {
                throw new HTTP401Error('Invalid or expired token');
            }
            const user = await this.userService.findUserById(t.userId);
            user.isVerified = true;
            user.save();
            t.delete();
            responseHandler.onFetch('User Verified Successfully').send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };

    private resetPasswordEmail = async (
        req: Request<{}, {}, EmailBody['body']>,
        res: Response,
        next: NextFunction
    ) => {
        const responseHandler = new ResponseHandler(req, res);
        try {
            const { email } = req.body;
            const user = await this.userService.findUserByEmail(email);
            let token = await this.tokenService.findToken({ userId: user._id });
            if (!token) {
                token = await this.tokenService.create({
                    userId: user._id,
                    token: crypto.randomBytes(32).toString('hex'),
                });
            }
            const mailer = new Mailer();
            mailer.sendResetPasswordEmail(user, token.token);
            responseHandler
                .onFetch('reset password', {
                    message: 'email as been sent to your email address',
                })
                .send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };

    private resetPassword = async (
        req: Request<
            ResetPasswordInput['params'],
            {},
            ResetPasswordInput['body']
        >,
        res: Response,
        next: NextFunction
    ) => {
        const responseHandler = new ResponseHandler(req, res);
        try {
            const { userId, token } = req.params;
            const { password } = req.body;
            const t = await this.tokenService.findToken({ userId, token });
            if (!t) {
                throw new HTTP401Error('Invalid or expired token');
            }
            const user = await this.userService.findUserById(t.userId);
            user.password = password;
            user.save();
            t.delete();
            responseHandler.onFetch('password changed successfully').send();
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
            const { user, accessToken, refreshToken } =
                await this.userService.refreshToken(token);
            setRefreshTokenCookie(res, refreshToken);
            responseHandler
                .onFetch('access Token', { user, accessToken })
                .send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };
}

export default UserController;
