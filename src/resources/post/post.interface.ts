import { Document } from 'mongoose';
import User from '../user/user.interface';

export interface Comment extends Document {
    user: User;
    content: string;
    likes: string[];
    replies: {
        user: User;
        content: string;
        likes: string[];
    }[];
}

export default interface Post extends Document {
    description: string;
    image?: string;
    address?: string;
    location?: {
        lat: number;
        lng: number;
    };
    likes: string[];
    comments: Comment;
    creator: User;
    createdAt: Date;
    updatedAt: Date;
}
