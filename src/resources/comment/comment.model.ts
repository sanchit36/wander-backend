import { model, Schema } from 'mongoose';
import { Comment, Reply } from './comment.interface';

const replySchema = new Schema({
    comment: { type: Schema.Types.ObjectId, ref: 'Comment', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    content: {
        type: String,
        max: [255, 'comment can not exceed 255 characters'],
    },
});

export const ReplyModel = model<Reply>('Reply', replySchema);

const commentSchema = new Schema({
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: {
        type: String,
        max: [255, 'comment can not exceed 255 characters'],
        required: true,
    },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    replies: [{ type: Schema.Types.ObjectId, ref: 'Reply' }],
});

const CommentModel = model<Comment>('Comment', commentSchema);

export default CommentModel;
