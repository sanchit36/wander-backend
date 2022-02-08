import {
    HTTP400Error,
    HTTP403Error,
    HTTP404Error,
} from '@/utils/http/http.exception';
import PostService from '../post/post.service';
import { Comment, Reply } from './comment.interface';
import CommentModel, { ReplyModel } from './comment.model';
import { CreateCommentInput, CreateReplyInput } from './comment.schema';

class CommentService {
    private postService = new PostService();
    private comment = CommentModel;
    private replyModel = ReplyModel;

    // FETCH A COMMENT BY ID
    public async fetchCommentById(cid: string): Promise<Comment> {
        try {
            const comment = await this.comment
                .findById(cid)
                .populate('user', ['username', 'avatar']);
            if (!comment) {
                throw new Error();
            }
            return comment;
        } catch (error) {
            throw new HTTP404Error('Unable to find the comment');
        }
    }

    // FETCH A REPLY BY ID
    public async fetchReplyById(rid: string): Promise<Reply> {
        try {
            const reply = await this.replyModel
                .findById(rid)
                .populate('user', ['username', 'avatar']);
            if (!reply) {
                throw new Error();
            }
            return reply;
        } catch (error) {
            throw new HTTP404Error('Unable to find the reply');
        }
    }

    // FETCH ALL COMMENTS
    public async fetchAllComments(postId: string): Promise<Comment[]> {
        try {
            const comments = await this.comment
                .find({ post: postId })
                .populate('user', ['username', 'avatar']);
            return comments;
        } catch (error) {
            throw new HTTP404Error('Unable to find the comment');
        }
    }

    // FETCH ALL REPLIES
    public async fetchAllReplies(cid: string): Promise<Reply[]> {
        try {
            const replies = await this.replyModel
                .find({ comment: cid })
                .populate('user', ['username', 'avatar']);
            return replies;
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
                post: postId,
                user: userId,
                content,
            });
            await post.updateOne({ $push: { comments: comment } });
            return comment;
        } catch (error) {
            throw error;
        }
    }

    // DELETE A COMMENT
    public async deleteComment(
        postId: string,
        commentId: string,
        userId: string
    ) {
        try {
            const post = await this.postService.fetchById(postId);
            const comment = await this.fetchCommentById(commentId);
            if (comment.user.id.toString() !== userId) {
                throw new HTTP403Error('you are not allowed to do that');
            }
            await post.updateOne({ $pull: { comments: comment.id } });
            await comment.delete();
        } catch (error) {
            throw error;
        }
    }

    // LIKE A COMMENT
    public async likeComment(commentId: string, userId: string) {
        try {
            const comment = await this.fetchCommentById(commentId);
            if (!comment.likes.includes(userId)) {
                await comment.updateOne({ $push: { likes: userId } });
            } else {
                throw new HTTP400Error('you have already liked this comment');
            }
        } catch (error) {
            throw error;
        }
    }

    // UNLIKE A COMMENT
    public async unlikeComment(commentId: string, userId: string) {
        try {
            const comment = await this.fetchCommentById(commentId);
            if (comment.likes.includes(userId)) {
                await comment.updateOne({ $pull: { likes: userId } });
            } else {
                throw new HTTP400Error("you don't have liked this comment");
            }
        } catch (error) {
            throw error;
        }
    }

    // ADD A NEW REPLY
    public async addReply(
        userId: string,
        userInput: { cid: string; content: string }
    ) {
        try {
            const { cid, content } = userInput;
            const comment = await this.fetchCommentById(cid);
            const newReply = await this.replyModel.create({
                comment: cid,
                user: userId,
                content,
            });
            await comment.updateOne({ $push: { replies: newReply._id } });
            return newReply;
        } catch (error) {
            throw error;
        }
    }

    // REMOVE A REPLY
    public async removeReply(
        userId: string,
        userInput: { cid: string; rid: string }
    ) {
        try {
            const { cid, rid } = userInput;
            const comment = await this.fetchCommentById(cid);
            const reply = await this.fetchReplyById(rid);
            if (reply.user.id.toString() !== userId) {
                throw new HTTP403Error('you are not allowed to do that');
            }
            await comment.updateOne({ $pull: { replies: rid } });
            await reply.delete();
        } catch (error) {
            throw error;
        }
    }

    // LIKE A REPLY
    public async likeReply(rid: string, userId: string) {
        try {
            const reply = await this.fetchReplyById(rid);
            if (!reply.likes.includes(userId)) {
                await reply.updateOne({ $push: { likes: userId } });
            } else {
                throw new HTTP400Error('you have already liked this reply');
            }
        } catch (error) {
            throw error;
        }
    }

    // UNLIKE A REPLY
    public async unlikeReply(rid: string, userId: string) {
        try {
            const reply = await this.fetchReplyById(rid);
            if (reply.likes.includes(userId)) {
                await reply.updateOne({ $pull: { likes: userId } });
            } else {
                throw new HTTP400Error("you don't have liked this reply");
            }
        } catch (error) {
            throw error;
        }
    }
}

export default CommentService;
