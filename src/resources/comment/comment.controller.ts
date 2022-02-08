import { NextFunction, Request, Response, Router } from 'express';

import requireUser from '@/middleware/requireUser.middleware';
import validate from '@/middleware/validateResource.middleware';
import ResponseHandler from '@/utils/http/http.response';
import Controller from '@/utils/interfaces/controller.interface';
import PayloadJwt from '@/utils/interfaces/payload.interface';
import {
    CreateCommentInput,
    createCommentSchema,
    CreateReplyInput,
    createReplySchema,
    RemoveReplyInput,
    removeReplySchema,
} from './comment.schema';
import CommentService from './comment.service';

class CommentController implements Controller {
    public path = '/comments';
    public router = Router();
    private commentService = new CommentService();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        // GET COMMENTS FOR A POST
        this.router.get(`${this.path}/:pid`, this.getAllComments);

        // POST A COMMENT
        this.router.post(
            `${this.path}`,
            requireUser,
            validate(createCommentSchema),
            this.createComment
        );

        // DELETE A COMMENT
        this.router.delete(
            `${this.path}/:pid/:cid`,
            requireUser,
            this.deleteComment
        );

        // LIKE A COMMENT
        this.router.patch(
            `${this.path}/:cid/like`,
            requireUser,
            this.likeComment
        );

        // UNLIKE A COMMENT
        this.router.patch(
            `${this.path}/:cid/unlike`,
            requireUser,
            this.unlikeComment
        );

        // GET ALL REPLY FOR A COMMENT
        this.router.get(`${this.path}/:cid/reply`, this.getAllReplies);

        // POST A REPLY
        this.router.post(
            `${this.path}/:cid/reply`,
            requireUser,
            validate(createReplySchema),
            this.addReply
        );

        // DELETE A REPLY
        this.router.delete(
            `${this.path}/:cid/reply/:rid`,
            requireUser,
            validate(removeReplySchema),
            this.removeReply
        );

        // LIKE A REPLY
        this.router.patch(
            `${this.path}/:cid/reply/:rid/like`,
            requireUser,
            this.likeReply
        );

        // UNLIKE A REPLY
        this.router.patch(
            `${this.path}/:cid/reply/:rid/unlike`,
            requireUser,
            this.unlikeReply
        );
    }

    // GET ALL COMMENTS
    private getAllComments = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const responseHandler = new ResponseHandler(req, res);
        try {
            const pid = req.params.pid;
            const comments = await this.commentService.fetchAllComments(pid);
            responseHandler.onFetch('All comments fetched', comments).send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };

    private createComment = async (
        req: Request<{}, {}, CreateCommentInput['body']>,
        res: Response,
        next: NextFunction
    ) => {
        const responseHandler = new ResponseHandler(req, res);
        try {
            const userId = (res.locals.user as PayloadJwt).userId;
            const comment = await this.commentService.createComment(
                userId,
                req.body
            );
            responseHandler
                .onCreate('Post comment successfully', comment)
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
        try {
            const pid = req.params.pid;
            const cid = req.params.cid;
            const userId = (res.locals.user as PayloadJwt).userId;
            const comment = await this.commentService.deleteComment(
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

    private likeComment = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const responseHandler = new ResponseHandler(req, res);
        try {
            const cid = req.params.cid;
            const userId = (res.locals.user as PayloadJwt).userId;
            const comment = await this.commentService.likeComment(cid, userId);
            responseHandler
                .onFetch('comment like successfully', comment)
                .send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };

    private unlikeComment = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const responseHandler = new ResponseHandler(req, res);
        try {
            const cid = req.params.cid;
            const userId = (res.locals.user as PayloadJwt).userId;
            const comment = await this.commentService.unlikeComment(
                cid,
                userId
            );
            responseHandler
                .onFetch('comment unlike successfully', comment)
                .send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };

    private getAllReplies = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const responseHandler = new ResponseHandler(req, res);
        try {
            const cid = req.params.cid;
            const replies = await this.commentService.fetchAllReplies(cid);
            responseHandler
                .onFetch('fetched all replies successfully', replies)
                .send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };

    private addReply = async (
        req: Request<CreateReplyInput['params'], {}, CreateReplyInput['body']>,
        res: Response,
        next: NextFunction
    ) => {
        const responseHandler = new ResponseHandler(req, res);
        try {
            const userId = (res.locals.user as PayloadJwt).userId;
            const reply = await this.commentService.addReply(userId, {
                ...req.params,
                ...req.body,
            });
            responseHandler.onFetch('reply added successfully', reply).send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };

    private removeReply = async (
        req: Request<RemoveReplyInput['params']>,
        res: Response,
        next: NextFunction
    ) => {
        const responseHandler = new ResponseHandler(req, res);
        try {
            const userId = (res.locals.user as PayloadJwt).userId;
            await this.commentService.removeReply(userId, req.params);
            responseHandler.onFetch('deleted reply successfully').send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };

    private likeReply = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const responseHandler = new ResponseHandler(req, res);
        try {
            const rid = req.params.rid;
            const userId = (res.locals.user as PayloadJwt).userId;
            await this.commentService.likeReply(rid, userId);
            responseHandler.onFetch('reply like successfully').send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };

    private unlikeReply = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const responseHandler = new ResponseHandler(req, res);
        try {
            const rid = req.params.rid;
            const userId = (res.locals.user as PayloadJwt).userId;
            await this.commentService.unlikeReply(rid, userId);
            responseHandler.onFetch('reply unlike successfully').send();
        } catch (error) {
            next(responseHandler.sendError(error));
        }
    };
}

export default CommentController;
