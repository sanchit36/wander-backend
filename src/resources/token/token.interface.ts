import { Document } from 'mongoose';

export default interface Token extends Document {
    userId: string;
    token: string;
    createdAd: number;
}
