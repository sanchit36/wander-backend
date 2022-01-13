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
    }).refine((data) => data.password === data.passwordConfirmation, {
        message: 'Passwords do not match',
        path: ['passwordConfirmation'],
    }),
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

export type CreateUserInput = Omit<
    TypeOf<typeof createUserSchema>,
    'body.passwordConfirmation'
>;

export type LoginUserInput = TypeOf<typeof loginUserSchema>;
