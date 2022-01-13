import UserModel from '@/resources/user/user.model';
import User from '@/resources/user/user.interface';
import { CreateUserInput, LoginUserInput } from './user.schema';
import { HTTP403Error, HTTP404Error } from '@/utils/http/http.exception';

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
}

export default UserService;
