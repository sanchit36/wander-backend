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

export type CreateCommentInput = TypeOf<typeof createCommentSchema>;
