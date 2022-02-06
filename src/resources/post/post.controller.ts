import { NextFunction, Request, Response, Router } from 'express';

import Controller from '@/utils/interfaces/controller.interface';
import PostService from '@/resources/post/post.service';
import ResponseHandler from '@/utils/http/http.response';
import requireUser from '@/middleware/requireUser.middleware';
import {
    CommentInput,
    commentSchema,
    CreatePostInput,
    createPostSchema,
    GetPostInput,
    getPostSchema,
    LikeInput,
    likeSchema,
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
        // GET ALL POST
        this.router.get(`${this.path}`, this.getPosts);

        // GET SINGLE POST
        this.router.get(
            `${this.path}/:pid`,
            validate(getPostSchema),
            this.getPost
        );

        // CREATE A POST
        this.router.post(
            `${this.path}`,
            requireUser,
            fileUpload.fields([{ name: 'image', maxCount: 1 }]),
            validate(createPostSchema),
            uploadToCloud,
            this.createPost
        );

        // UPDATE A POST
        this.router.put(
            `${this.path}/:pid`,
            requireUser,
            fileUpload.fields([{ name: 'image', maxCount: 1 }]),
            validate(updatePostSchema),
            uploadToCloud,
            this.updatePost
        );

        // DELETE A POST
        this.router.delete(
            `${this.path}/:pid`,
            requireUser,
            validate(getPostSchema),
            this.deletePost
        );

        // LIKE A POST
        this.router.patch(
            `${this.path}/:pid/like`,
            requireUser,
            validate(likeSchema),
            this.likeHandler
        );

        // UNLIKE A POST
        this.router.patch(
            `${this.path}/:pid/unlike`,
            requireUser,
            validate(likeSchema),
            this.unlikeHandler
        );

        // POST A COMMENT
        this.router.post(
            `${this.path}/:pid/comment`,
            requireUser,
            validate(commentSchema),
            this.createComment
        );

        // DELETE A COMMENT
        this.router.delete(
            `${this.path}/:pid/:cid`,
            requireUser,
            this.deleteComment
        );

        // LIKE A COMMENT

        // UNLIKE A COMMENT

        // POST A REPLAY

        // DELETE A REPLAY

        // LIKE A COMMENT

        // UNLIKE A COMMENT
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
            const userId = (res.locals.user as PayloadJwt).userId;
            const post = await this.postService.update(pid, userId, req.body);
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

    private likeHandler = async (
        req: Request<LikeInput['params'], {}, LikeInput['body']>,
        res: Response,
        next: NextFunction
    ) => {
        console.log('HELLO');
        const responseHandler = new ResponseHandler(req, res);
        const pid = req.params.pid;
        try {
            const userId = (res.locals.user as PayloadJwt).userId;
            await this.postService.like(pid, userId, req.body);
            responseHandler.onFetch('Post liked successfully').send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };

    private unlikeHandler = async (
        req: Request<LikeInput['params'], {}, LikeInput['body']>,
        res: Response,
        next: NextFunction
    ) => {
        const responseHandler = new ResponseHandler(req, res);
        const pid = req.params.pid;
        try {
            const userId = (res.locals.user as PayloadJwt).userId;
            const post = await this.postService.unlike(pid, userId, req.body);
            responseHandler.onFetch('Post unliked successfully', post).send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };

    private createComment = async (
        req: Request<CommentInput['params'], {}, CommentInput['body']>,
        res: Response,
        next: NextFunction
    ) => {
        const responseHandler = new ResponseHandler(req, res);
        const pid = req.params.pid;
        try {
            const userId = (res.locals.user as PayloadJwt).userId;
            const comment = await this.postService.createComment(
                pid,
                userId,
                req.body
            );
            responseHandler
                .onFetch('Post comment successfully', comment)
                .send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };

    private deleteComment = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const responseHandler = new ResponseHandler(req, res);
        const pid = req.params.pid;
        const cid = req.params.cid;
        try {
            const userId = (res.locals.user as PayloadJwt).userId;
            const comment = await this.postService.deleteComment(
                pid,
                cid,
                userId
            );
            responseHandler
                .onFetch('Post deleted successfully', comment)
                .send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };
}

export default PostController;
