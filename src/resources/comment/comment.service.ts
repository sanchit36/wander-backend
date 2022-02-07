import { HTTP403Error, HTTP404Error } from '@/utils/http/http.exception';
import PostService from '../post/post.service';
import { Comment } from './comment.interface';
import CommentModel from './comment.model';
import { CreateCommentInput } from './comment.schema';

class CommentService {
    private postService = new PostService();
    private comment = CommentModel;

    // FETCH A COMMENT BY ID
    public async fetchCommentById(cid: string): Promise<Comment> {
        try {
            const comment = await this.comment.findById(cid).populate('user');
            if (!comment) {
                throw new Error();
            }
            return comment;
        } catch (error) {
            throw new HTTP404Error('Unable to find the comment');
        }
    }

    // CREATE NEW COMMENT
    public async createComment(
        userId: string,
        userInput: CreateCommentInput['body']
    ) {
        try {
            const { postId, content } = userInput;
            const post = await this.postService.fetchById(postId);
            const comment = await this.comment.create({
                user: userId,
                content,
            });
            await post.updateOne({ $push: { comments: comment } });
            return comment;
        } catch (error) {
            throw error;
        }
    }

    public async deleteComment(
        postId: string,
        commentId: string,
        userId: string
    ) {
        try {
            const post = await this.postService.fetchById(postId);
            const comment = await this.fetchCommentById(commentId);
            console.log(comment.user.id);
            if (comment.user.id.toString() !== userId) {
                throw new HTTP403Error('you are not allowed to do that');
            }
            await post.updateOne({ $pull: { comments: comment.id } });
            await comment.delete();
        } catch (error) {
            throw error;
        }
    }
}

export default CommentService;
