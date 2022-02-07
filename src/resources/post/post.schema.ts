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
        image: string().optional(),
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
        image: string().optional(),
    }).strict(),
});

export const likeSchema = object({
    params: object({
        pid: string({
            required_error: 'postId is required',
        }),
    }),
});

export type CreatePostInput = TypeOf<typeof createPostSchema>;
export type GetPostInput = TypeOf<typeof getPostSchema>;
export type UpdatePostInput = TypeOf<typeof updatePostSchema>;
export type LikeInput = TypeOf<typeof likeSchema>;
