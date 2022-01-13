import { Document } from 'mongoose';

export default interface User extends Document {
    username: string;
    email: string;
    password: string;
    verifyToken: number;
    comparePassword(candidatePassword: string): Promise<boolean>;
    avatar?: string;
    bio?: string;
    dateOfBirth?: Date;
    role?: 'user' | 'admin';
    gender?: 'male' | 'female' | 'other';
    isVerified?: boolean;
    followers?: Array<string>;
    following?: Array<string>;
}
