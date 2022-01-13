import PostModel from '@/resources/post/post.model';
import Post from '@/resources/post/post.interface';

class PostService {
    private post = PostModel;

    public async fetchAll(): Promise<Post[]> {
        try {
            const posts = await this.post.find();
            return posts;
        } catch (error) {
            throw new Error('Unable to find post');
        }
    }

    public async create(title: string, body: string): Promise<Post> {
        try {
            const post = await this.post.create({ title, body });
            return post;
        } catch (error) {
            throw new Error('Unable to create post');
        }
    }
}

export default PostService;
