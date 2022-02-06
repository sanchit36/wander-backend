import UserModel from '@/resources/user/user.model';
import User from '@/resources/user/user.interface';
import {
    CreateUserInput,
    LoginUserInput,
    UpdateUserInput,
} from './user.schema';
import {
    HTTP400Error,
    HTTP403Error,
    HTTP404Error,
} from '@/utils/http/http.exception';
import { verifyJwt } from '@/utils/jwt.utils';
import {
    generateAccessToken,
    generateRefreshToken,
} from '@/utils/secureTokens.utils';
import { startSession } from 'mongoose';

class UserService {
    private User = UserModel;

    public async findUserByUsername(username: string): Promise<User> {
        try {
            const user = await this.User.findOne({ username: username });
            if (!user) {
                throw new HTTP404Error('Could not find user.');
            }
            return user;
        } catch (error) {
            throw new HTTP404Error('Could not find user.');
        }
    }

    public async findUserById(id: string): Promise<User> {
        try {
            const user = await this.User.findById(id);
            if (!user) {
                throw new HTTP404Error('Could not find user.');
            }
            return user;
        } catch (error) {
            throw new HTTP404Error('Could not find user.');
        }
    }

    public async findUserByEmail(email: string): Promise<User> {
        try {
            const user = await this.User.findOne({ email });
            if (!user) {
                throw new HTTP404Error('Could not find user.');
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

    public async update(
        userId: string,
        userInput: UpdateUserInput['body']
    ): Promise<User> {
        try {
            const user = await this.User.findByIdAndUpdate(
                userId,
                { $set: userInput },
                { new: true }
            );
            if (!user) {
                throw new HTTP404Error('Could not find user.');
            }
            return user;
        } catch (error) {
            throw error;
        }
    }

    public async delete(userId: string) {
        try {
            const user = await this.User.findByIdAndDelete(userId, {
                new: true,
            });
            if (!user) {
                throw new HTTP404Error('Could not find user.');
            }
            return user;
        } catch (error) {
            throw error;
        }
    }

    public async follow(userId: string, currentUserId: string) {
        try {
            if (userId === currentUserId) {
                throw new HTTP400Error('You can not follow yourself');
            }
            const user = await this.findUserById(userId);
            const currentUser = await this.findUserById(currentUserId);

            if (!user.followers?.includes(currentUserId)) {
                await user.updateOne({ $push: { followers: currentUserId } });
                await currentUser.updateOne({ $push: { following: userId } });
                return;
            } else {
                throw new HTTP400Error('You already follow this user');
            }
        } catch (error) {
            throw error;
        }
    }

    public async unFollow(userId: string, currentUserId: string) {
        try {
            if (userId === currentUserId) {
                throw new HTTP400Error('You can not unFollow yourself');
            }

            const user = await this.findUserById(userId);
            const currentUser = await this.findUserById(currentUserId);

            if (user.followers?.includes(currentUserId)) {
                await user.updateOne({ $pull: { followers: currentUserId } });
                await currentUser.updateOne({ $pull: { following: userId } });
                return;
            } else {
                throw new HTTP400Error("You don't follow this user");
            }
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

            const isValid = await user.comparePassword(loginInput.password);

            console.log(isValid);

            if (!isValid) {
                throw new HTTP403Error('Invalid email or password');
            }

            return user;
        } catch (error) {
            throw error;
        }
    }

    public async refreshToken(refreshToken?: string): Promise<{
        user: User | null;
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
                user,
                accessToken,
                refreshToken: newRefreshToken,
            };
        } catch (error) {
            return {
                user: null,
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
