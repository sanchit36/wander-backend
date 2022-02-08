import { object, string, TypeOf } from 'zod';

export const createCommentSchema = object({
    body: object({
        postId: string({
            required_error: 'postId is required',
        }),
        content: string({
            required_error: 'content is required',
        }),
    }).strict(),
});

export const createReplySchema = object({
    params: object({
        cid: string({
            required_error: 'commentId is required',
        }),
    }).strict(),
    body: object({
        content: string({
            required_error: 'content is required',
        }),
    }).strict(),
});

export const removeReplySchema = object({
    params: object({
        cid: string({
            required_error: 'commentId is required',
        }),
        rid: string({
            required_error: 'replyId is required',
        }),
    }).strict(),
});

export type CreateCommentInput = TypeOf<typeof createCommentSchema>;
export type CreateReplyInput = TypeOf<typeof createReplySchema>;
export type RemoveReplyInput = TypeOf<typeof removeReplySchema>;
