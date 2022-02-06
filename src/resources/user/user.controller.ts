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
    UpdateUserInput,
    updateUserSchema,
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
import requireUser from '@/middleware/requireUser.middleware';
import { fileUpload, uploadToCloud } from '@/middleware/file-upload.middleware';
import PayloadJwt from '@/utils/interfaces/payload.interface';

class UserController implements Controller {
    public path = '/users';
    public router = Router();
    private userService = new UserService();
    private tokenService = new TokenService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        // SignUp User
        this.router.post(
            `${this.path}/signup`,
            validate(createUserSchema),
            this.createUser
        );
        // Login A User
        this.router.post(
            `${this.path}/login`,
            validate(loginUserSchema),
            this.loginUser
        );
        // Logout A User
        this.router.post(`${this.path}/logout`, requireUser, this.logoutUser);
        // Verify User Email - GET TOKEN
        this.router.post(
            `${this.path}/verify-email`,
            validate(emailBody),
            this.getVerificationEmail
        );
        // Verify User Email - validate Token
        this.router.patch(
            `${this.path}/verify-email/:userId/:token`,
            validate(verifyUserSchema),
            this.verifyUserEmail
        );
        // Reset Password - GET TOKEN
        this.router.post(
            `${this.path}/reset-password`,
            validate(emailBody),
            this.resetPasswordEmail
        );
        // Reset Password - VALIDATE TOKEN
        this.router.patch(
            `${this.path}/reset-password/:userId/:token`,
            validate(resetPassword),
            this.resetPassword
        );
        // REFRESH TOKEN
        this.router.get(`${this.path}/refresh-token`, this.refreshToken);

        // UPDATE USER ROUTE
        this.router.put(
            `${this.path}/me`,
            requireUser,
            fileUpload.fields([
                { name: 'avatar', maxCount: 1 },
                { name: 'coverPicture', maxCount: 1 },
            ]),
            validate(updateUserSchema),
            uploadToCloud,
            this.update
        );

        // DELETE USER ROUTE`
        this.router.delete(`${this.path}/me`, requireUser, this.delete);

        // GET USER ROUTE
        this.router.get(`${this.path}/:username`, this.get);

        // FOLLOW A USER ROUTE
        this.router.patch(
            `${this.path}/:userId/follow`,
            requireUser,
            this.follow
        );

        // UNFOLLOW A USER ROUTE
        this.router.patch(
            `${this.path}/:userId/unfollow`,
            requireUser,
            this.unFollow
        );
    }

    // CREATE USER - SIGN UP
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

    // LOGIN A User
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

    // LOGOUT
    private logoutUser = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        res.clearCookie('jid');
        res.send('logged out successfully');
    };

    // SEND EMAIL FOR EMAIL VERIFICATION
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

    // VERIFY THE USER EMAIL
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

    // SEND RESET PASSWORD EMAIL
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

    // RESET PASSWORD VERIFICATION
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

    // REFRESH TOKEN
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

    // UPDATE USER
    private update = async (
        req: Request<{}, {}, UpdateUserInput['body']>,
        res: Response,
        next: NextFunction
    ) => {
        console.log(req.body);
        const responseHandler = new ResponseHandler(req, res);
        try {
            const userId = (res.locals.user as PayloadJwt).userId;
            const user = await this.userService.update(userId, req.body);
            responseHandler.onFetch('user updated successfully', user).send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };

    // DELETE USER
    private delete = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const responseHandler = new ResponseHandler(req, res);
        try {
            const userId = (res.locals.user as PayloadJwt).userId;
            const user = await this.userService.delete(userId);
            responseHandler.onFetch('user deleted successfully', user).send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };

    // GET A USER
    private get = async (req: Request, res: Response, next: NextFunction) => {
        const responseHandler = new ResponseHandler(req, res);
        try {
            const username = req.params.username;
            const user = await this.userService.findUserByUsername(username);
            responseHandler.onFetch('user found successfully', user).send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };

    // FOLLOW A USER
    private follow = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const responseHandler = new ResponseHandler(req, res);
        try {
            const userId = (res.locals.user as PayloadJwt).userId;
            await this.userService.follow(req.params.userId, userId);
            responseHandler
                .onFetch('user has been followed successfully')
                .send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };

    // unFollow A USER
    private unFollow = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const responseHandler = new ResponseHandler(req, res);
        try {
            const userId = (res.locals.user as PayloadJwt).userId;
            await this.userService.unFollow(req.params.userId, userId);
            responseHandler
                .onFetch('user has been unFollowed successfully')
                .send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };
}

export default UserController;
