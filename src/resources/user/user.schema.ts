import { update } from 'lodash';
import { object, string, TypeOf } from 'zod';

export const createUserSchema = object({
    body: object({
        username: string({
            required_error: 'username is required',
        }),
        password: string({
            required_error: 'Password is required',
        }).min(6, 'Password must be at least 6 characters'),
        passwordConfirmation: string({
            required_error: 'passwordConfirmation is required',
        }),
        email: string({
            required_error: 'email is required',
        }).email('Not a valid email address'),
    })
        .strict()
        .refine((data) => data.password === data.passwordConfirmation, {
            message: 'Passwords do not match',
            path: ['passwordConfirmation'],
        }),
});

export const updateUserSchema = object({
    body: object({
        bio: string().optional(),
        avatar: string().optional(),
        coverPicture: string().optional(),
        dateOfBirth: string().optional(),
        gender: string().optional(),
    }).strict(),
});

export const loginUserSchema = object({
    body: object({
        email: string({
            required_error: 'Email is required',
        }).email('Provide a valid email address'),
        password: string({
            required_error: 'Password is required',
        }),
    }),
});

const params = {
    params: object({
        userId: string({
            required_error: 'UserId is required',
        }),
        token: string({
            required_error: 'Token is required',
        }),
    }),
};

const password = {
    body: object({
        password: string({
            required_error: 'Password is required',
        }),
    }),
};

export const verifyUserSchema = object({
    ...params,
});

export const resetPassword = object({
    ...params,
    ...password,
});

export const emailBody = object({
    body: object({
        email: string({
            required_error: 'Email is required',
        }),
    }),
});

export type CreateUserInput = Omit<
    TypeOf<typeof createUserSchema>,
    'body.passwordConfirmation'
>;

export type UpdateUserInput = TypeOf<typeof updateUserSchema>;

export type LoginUserInput = TypeOf<typeof loginUserSchema>;

export type VerifyUserInput = TypeOf<typeof verifyUserSchema>;

export type EmailBody = TypeOf<typeof emailBody>;

export type ResetPasswordInput = TypeOf<typeof resetPassword>;
