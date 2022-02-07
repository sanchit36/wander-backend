import { Document } from 'mongoose';
import User from '../user/user.interface';

interface Reply {
    user: User;
    content: string;
    likes: string[];
}

export interface Comment extends Document {
    user: User;
    content: string;
    likes: string[];
    replies: Reply[];
}
