import { NextFunction, Request, Response, Router } from 'express';

import requireUser from '@/middleware/requireUser.middleware';
import validate from '@/middleware/validateResource.middleware';
import ResponseHandler from '@/utils/http/http.response';
import Controller from '@/utils/interfaces/controller.interface';
import PayloadJwt from '@/utils/interfaces/payload.interface';
import { CreateCommentInput, createCommentSchema } from './comment.schema';
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
        // this.router.patch();

        // UNLIKE A COMMENT

        // GET ALL REPLY FOR A COMMENT

        // POST A REPLY

        // DELETE A REPLY

        // LIKE A REPLY

        // UNLIKE A REPLY
    }

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
}

export default CommentController;
