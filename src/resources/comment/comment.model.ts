import { model, Schema } from 'mongoose';
import { Comment } from './comment.interface';

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

const CommentModel = model<Comment>('Comment', commentSchema);

export default CommentModel;
