import UserModel from '@/resources/user/user.model';
import User from '@/resources/user/user.interface';

class UserService {
    private User = UserModel;

    public async create(userInput: User): Promise<User> {
        try {
            const user = await this.User.create(userInput);
            return user;
        } catch (error) {
            throw error;
        }
    }
}

export default UserService;
