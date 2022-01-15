import { HTTP401Error } from '@/utils/http/http.exception';
import { FilterQuery } from 'mongoose';
import Token from './token.interface';
import tokenModel from './token.model';

class TokenService {
    private Token = tokenModel;

    public async findToken(query: FilterQuery<Token>): Promise<Token | null> {
        try {
            const token = await this.Token.findOne(query);
            return token;
        } catch (error) {
            throw new HTTP401Error('Invalid or expired token');
        }
    }

    public async create(tokenInput: {
        userId: string;
        token: string;
    }): Promise<Token> {
        try {
            const token = await this.Token.create(tokenInput);
            return token;
        } catch (error) {
            throw error;
        }
    }
}

export default TokenService;
