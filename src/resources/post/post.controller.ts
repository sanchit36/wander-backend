import { NextFunction, Request, Response, Router } from 'express';

import Controller from '@/utils/interfaces/controller.interface';
import PostService from '@/resources/post/post.service';
import ResponseHandler from '@/utils/http/http.response';
import requireUser from '@/middleware/requireUser.middleware';
import {
    CreatePostInput,
    createPostSchema,
    GetPostInput,
    getPostSchema,
    UpdatePostInput,
    updatePostSchema,
} from './post.schema';
import validate from '@/middleware/validateResource.middleware';
import PayloadJwt from '@/utils/interfaces/payload.interface';
import { fileUpload, uploadToCloud } from '@/middleware/file-upload.middleware';

class PostController implements Controller {
    public path = '/posts';
    public router = Router();
    private postService = new PostService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get(`${this.path}`, this.getPosts);
        this.router.get(
            `${this.path}/:pid`,
            validate(getPostSchema),
            this.getPost
        );

        this.router.post(
            `${this.path}`,
            requireUser,
            fileUpload.fields([{ name: 'image', maxCount: 1 }]),
            validate(createPostSchema),
            uploadToCloud,
            this.createPost
        );

        this.router.put(
            `${this.path}/:pid`,
            requireUser,
            validate(updatePostSchema),
            uploadToCloud,
            this.updatePost
        );

        this.router.patch(
            `${this.path}/:pid/image`,
            requireUser,
            fileUpload.fields([{ name: 'image', maxCount: 1 }]),
            uploadToCloud,
            this.updatePostImage
        );

        this.router.delete(
            `${this.path}/:pid`,
            requireUser,
            validate(getPostSchema),
            this.deletePost
        );
    }

    private getPosts = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const responseHandler = new ResponseHandler(req, res);
        try {
            const posts = await this.postService.fetchAll();
            responseHandler.onFetch('All posts', posts).send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };

    private getPost = async (
        req: Request<GetPostInput['params']>,
        res: Response,
        next: NextFunction
    ) => {
        const pid = req.params.pid;
        const responseHandler = new ResponseHandler(req, res);
        try {
            const post = await this.postService.fetchById(pid);
            responseHandler.onFetch('post', post).send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };

    private createPost = async (
        req: Request<{}, {}, CreatePostInput['body']>,
        res: Response,
        next: NextFunction
    ) => {
        const responseHandler = new ResponseHandler(req, res);
        try {
            const { description, address } = req.body;
            const userId = (res.locals.user as PayloadJwt).userId;
            const image = req.body['image'];
            const post = await this.postService.create(
                userId,
                description,
                image,
                address
            );
            responseHandler.onCreate('Post created successfully', post).send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };

    private updatePost = async (
        req: Request<UpdatePostInput['params'], {}, UpdatePostInput['body']>,
        res: Response,
        next: NextFunction
    ) => {
        const pid = req.params.pid;
        const responseHandler = new ResponseHandler(req, res);
        try {
            const { description, address } = req.body;
            const userId = (res.locals.user as PayloadJwt).userId;
            const image = res.locals.image;
            const post = await this.postService.update(pid, userId, {
                description,
                image,
                address,
            });
            responseHandler.onFetch('Post updated successfully', post).send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };

    private updatePostImage = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const pid = req.params.pid;
        const responseHandler = new ResponseHandler(req, res);
        try {
            const userId = (res.locals.user as PayloadJwt).userId;
            const image = req.body['image'];
            const post = await this.postService.updateImage(pid, userId, image);
            responseHandler.onFetch('Post updated successfully', post).send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };

    private deletePost = async (
        req: Request<GetPostInput['params']>,
        res: Response,
        next: NextFunction
    ) => {
        const pid = req.params.pid;
        const responseHandler = new ResponseHandler(req, res);
        try {
            const userId = (res.locals.user as PayloadJwt).userId;
            await this.postService.delete(pid, userId);
            responseHandler.onFetch('Post deleted successfully').send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };
}

export default PostController;
