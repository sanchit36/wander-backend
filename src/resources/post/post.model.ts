import { Schema, model } from 'mongoose';
import Post, { Comment } from '@/resources/post/post.interface';

const commentSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    content: {
        type: String,
        max: [255, 'comment can not exceed 255 characters'],
    },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    replies: [
        {
            user: { type: Schema.Types.ObjectId, ref: 'User' },
            likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
            content: {
                type: String,
                max: [255, 'comment can not exceed 255 characters'],
            },
        },
    ],
});

export const CommentModel = model<Comment>('Comment', commentSchema);

const postSchema = new Schema(
    {
        description: {
            type: String,
            required: true,
            max: [500, 'comment can not exceed 500 characters'],
        },
        image: { type: String },
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
