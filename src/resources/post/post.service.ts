import PostModel, { CommentModel } from '@/resources/post/post.model';
import Post, { Comment } from '@/resources/post/post.interface';
import getCoordinatesFromAddress from '@/utils/helpers/location';
import {
    HTTP400Error,
    HTTP403Error,
    HTTP404Error,
} from '@/utils/http/http.exception';
import { CommentInput, LikeInput, UpdatePostInput } from './post.schema';

class PostService {
    private post = PostModel;
    private comment = CommentModel;

    public async fetchById(pid: string): Promise<Post> {
        try {
            const post = await this.post.findById(pid).populate('creator');
            if (!post) {
                throw new Error();
            }
            return post;
        } catch (error) {
            throw new HTTP404Error('Unable to find the post');
        }
    }

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

    public async fetchAll(): Promise<Post[]> {
        try {
            const posts = await this.post.find().populate('creator');
            return posts;
        } catch (error) {
            throw new HTTP404Error('Unable to find posts');
        }
    }

    public async create(
        userId: string,
        description: string,
        image?: string,
        address?: string
    ): Promise<Post> {
        try {
            let location;
            if (address) {
                location = await getCoordinatesFromAddress(address);
            }

            const post = await this.post.create({
                description,
                creator: userId,
                address,
                location,
                image,
            });

            return post;
        } catch (error) {
            throw error;
        }
    }

    public async update(
        postId: string,
        userId: string,
        updates: UpdatePostInput['body']
    ): Promise<Post> {
        try {
            const post = await this.fetchById(postId);
            if (post.creator.toString() !== userId) {
                throw new HTTP403Error('you are not allowed to do that');
            }

            if (updates.description) {
                post.description = updates.description;
            }

            if (updates.image) {
                post.image = updates.image;
            }

            if (updates.address && post.address !== updates.address) {
                const location = await getCoordinatesFromAddress(
                    updates.address
                );
                post.location = location;
                post.address = updates.address;
            }

            await post.save();
            return post;
        } catch (error) {
            throw error;
        }
    }

    public async delete(postId: string, userId: string) {
        try {
            const post = await this.fetchById(postId);
            if (post.creator.toString() !== userId) {
                throw new HTTP403Error('you are not allowed to do that');
            }
            await post.delete();
        } catch (error) {
            throw error;
        }
    }

    public async like(postId: string, userId: string, body: LikeInput['body']) {
        try {
            const { type, id } = body;
            const post = await this.fetchById(postId);
            switch (type) {
                case 'POST': {
                    if (!post.likes.includes(userId)) {
                        await post.updateOne({
                            $push: { likes: userId },
                        });
                    } else {
                        throw new HTTP400Error(
                            'you have already liked this post'
                        );
                    }
                }
                case 'COMMENT':
                    break;
                case 'REPLY':
                    break;
                default:
                    throw new HTTP400Error(
                        `This type: ${type} is not supported`
                    );
            }
        } catch (error) {
            throw error;
        }
    }

    public async unlike(
        postId: string,
        userId: string,
        body: LikeInput['body']
    ) {
        try {
            const { type, id } = body;
            const post = await this.fetchById(postId);
            switch (type) {
                case 'POST': {
                    if (post.likes.includes(userId)) {
                        await post.updateOne({
                            $pull: { likes: userId },
                        });
                    } else {
                        throw new HTTP400Error(
                            "you don't have liked this post"
                        );
                    }
                    break;
                }
                case 'COMMENT':
                    break;
                case 'REPLY':
                    break;
                default:
                    throw new HTTP400Error(
                        `This type: ${type} is not supported`
                    );
            }
        } catch (error) {
            throw error;
        }
    }

    public async createComment(
        postId: string,
        userId: string,
        body: CommentInput['body']
    ) {
        try {
            const post = await this.fetchById(postId);
            const comment = await this.comment.create({
                user: userId,
                ...body,
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
            const post = await this.fetchById(postId);
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

export default PostService;
