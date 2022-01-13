import { NextFunction, Request, Response, Router } from 'express';

import Controller from '@/utils/interfaces/controller.interface';
import { HttpException } from '@/utils/exceptions/http.exception';
import PostService from '@/resources/post/post.service';
import ResponseHandler from '@/utils/response/http.response';

class PostController implements Controller {
    public path = '/posts';
    public router = Router();
    private postService = new PostService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get(`${this.path}`, this.getPosts);
        this.router.post(`${this.path}`, this.createPost);
    }

    private getPosts = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        const responseHandler = new ResponseHandler(req, res);
        try {
            const posts = await this.postService.fetchAll();
            responseHandler.onFetch('All posts', posts).send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };

    private createPost = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        const responseHandler = new ResponseHandler(req, res);
        try {
            const { title, body } = req.body;
            const post = await this.postService.create(title, body);
            responseHandler.onCreate('Post created successfully', post).send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };
}

export default PostController;
