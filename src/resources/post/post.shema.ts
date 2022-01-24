import { object, string, TypeOf } from 'zod';

const IdParam = {
    params: object({
        pid: string({
            required_error: 'post id is required',
        }),
    }),
};

export const createPostSchema = object({
    body: object({
        description: string({
            required_error: 'description is required',
        }),
        address: string().optional(),
    }),
});

export const getPostSchema = object({
    ...IdParam,
});

export const updatePostSchema = object({
    ...IdParam,
    body: object({
        description: string().optional(),
        address: string().optional(),
    }),
});

export type CreatePostInput = TypeOf<typeof createPostSchema>;
export type GetPostInput = TypeOf<typeof getPostSchema>;
export type UpdatePostInput = TypeOf<typeof updatePostSchema>;
