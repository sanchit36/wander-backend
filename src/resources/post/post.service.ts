import PostModel from '@/resources/post/post.model';
import Post from '@/resources/post/post.interface';
import getCoordinatesFromAddress from '@/utils/helpers/location';
import { HTTP403Error, HTTP404Error } from '@/utils/http/http.exception';

const updatesAllowed = ['description', 'address', 'image'];

class PostService {
    private post = PostModel;

    public async fetchById(pid: string): Promise<Post> {
        try {
            const post = await this.post.findById(pid);
            if (!post) {
                throw new Error();
            }
            return post;
        } catch (error) {
            throw new HTTP404Error('Unable to find the post');
        }
    }

    public async fetchAll(): Promise<Post[]> {
        try {
            const posts = await this.post.find();
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

    public async updateImage(
        postId: string,
        userId: string,
        image: string
    ): Promise<Post> {
        try {
            const post = await this.fetchById(postId);
            if (post.creator.toString() !== userId) {
                throw new HTTP403Error('you are not allowed to do that');
            }
            post.image = image;
            await post.save();
            return post;
        } catch (error) {
            throw error;
        }
    }

    public async update(
        postId: string,
        userId: string,
        updates: { [key: string]: string | undefined }
    ): Promise<Post> {
        try {
            const post = await this.fetchById(postId);
            if (post.creator.toString() !== userId) {
                throw new HTTP403Error('you are not allowed to do that');
            }

            if (updates.description) {
                post.description = updates.description;
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
}

export default PostService;
