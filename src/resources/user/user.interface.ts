import { Document } from 'mongoose';

export default interface User extends Document {
    username: string;
    email: string;
    avatar: string;
    bio: string;
    password: string;
    dateOfBirth: Date;
    role: 'user' | 'admin';
    gender: 'male' | 'female' | 'other';
    isVerified: boolean;
    followers: Array<string>;
    following: Array<string>;
}
