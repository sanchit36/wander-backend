import { Document } from 'mongoose';
import { Comment } from '../comment/comment.interface';
import User from '../user/user.interface';

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
