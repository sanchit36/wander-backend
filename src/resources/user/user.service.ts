import UserModel from '@/resources/user/user.model';
import User from '@/resources/user/user.interface';
import { CreateUserInput, LoginUserInput } from './user.schema';
import { HTTP403Error } from '@/utils/http/http.exception';

class UserService {
    private User = UserModel;

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
