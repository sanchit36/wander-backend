import { Document } from 'mongoose';
import Post from '../post/post.interface';
import User from '../user/user.interface';

export interface Reply extends Document {
    comment: Comment;
    user: User;
    content: string;
    likes: string[];
}

export interface Comment extends Document {
    post: Post;
    user: User;
    content: string;
    likes: string[];
    replies: Reply[];
}
