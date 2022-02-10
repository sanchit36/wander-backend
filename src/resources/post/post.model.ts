import { Schema, model } from 'mongoose';
import Post from '@/resources/post/post.interface';

const postSchema = new Schema(
    {
        description: {
            type: String,
            required: true,
            max: [500, 'comment can not exceed 500 characters'],
        },
        image: { type: String, required: [true, 'please provide a image'] },
        address: { type: String },
        location: {
            lat: { type: Number },
            lng: { type: Number },
        },
        creator: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
        likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    },
    { timestamps: true }
);

export default model<Post>('Post', postSchema);
