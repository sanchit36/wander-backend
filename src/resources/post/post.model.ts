import { Schema, model } from 'mongoose';
import Post from '@/resources/post/post.interface';

const PostSchema = new Schema(
    {
        description: { type: String, required: true },
        image: { type: String },
        address: { type: String },
        location: {
            lat: { type: Number },
            lng: { type: Number },
        },
        creator: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
        likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        comments: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true }
);

export default model<Post>('Post', PostSchema);
