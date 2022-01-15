import UserModel from '@/resources/user/user.model';
import User from '@/resources/user/user.interface';
import { CreateUserInput, LoginUserInput } from './user.schema';
import { HTTP403Error, HTTP404Error } from '@/utils/http/http.exception';
import { verifyJwt } from '@/utils/jwt.utils';
import {
    generateAccessToken,
    generateRefreshToken,
} from '@/utils/secureTokens.utils';

class UserService {
    private User = UserModel;

    public async findUserByEmail(email: string): Promise<User> {
        try {
            const user = await this.User.findOne({ email });
            if (!user) {
                throw new HTTP404Error(
                    'Could not find user with this email address.'
                );
            }
            return user;
        } catch (error) {
            throw error;
        }
    }

    public async create(userInput: CreateUserInput['body']): Promise<User> {
        try {
            const user = await this.User.create(userInput);
            return user;
        } catch (error) {
            throw error;
        }
    }

    public async login(loginInput: LoginUserInput['body']): Promise<User> {
        try {
            const user = await this.User.findOne({
                email: loginInput.email,
            });

            if (!user) {
                throw new HTTP403Error('Invalid email or password');
            }

            if (!user.isVerified) {
                throw new HTTP403Error('User is not verified');
            }

            const isValid = user.comparePassword(loginInput.password);

            if (!isValid) {
                throw new HTTP403Error('Invalid email or password');
            }

            return user;
        } catch (error) {
            throw error;
        }
    }

    public async refreshToken(refreshToken?: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }> {
        try {
            if (!refreshToken) {
                throw new Error();
            }

            const { valid, decoded, expired } = await verifyJwt(
                refreshToken,
                process.env.REFRESH_TOKEN_SECRET!
            );

            if (!valid || expired || !decoded) {
                throw new Error();
            }

            const user = await this.findUserByEmail(decoded?.email);

            if (user.tokenVersion !== decoded.tokenVersion) {
                throw new Error();
            }

            const accessToken = await generateAccessToken(user);
            const newRefreshToken = await generateRefreshToken(user);

            return {
                accessToken,
                refreshToken: newRefreshToken,
            };
        } catch (error) {
            return {
                accessToken: '',
                refreshToken: '',
            };
        }
    }

    public async revokeAllSessions(user: User) {
        user.tokenVersion += 1;
        user.save();
    }
}

export default UserService;
