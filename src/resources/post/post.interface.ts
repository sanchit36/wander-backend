import { Document } from 'mongoose';
import User from '../user/user.interface';

export default interface Post extends Document {
    description: string;
    image?: string;
    address?: string;
    location?: {
        lat: number;
        lng: number;
    };
    creator: User;
    createdAt: Date;
    updatedAt: Date;
}
