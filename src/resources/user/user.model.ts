import { Schema, model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';

import User from '@/resources/user/user.interface';

const UserSchema = new Schema(
    {
        username: {
            type: String,
            unique: true,
            required: [true, 'Username is required'],
            min: [3, 'Username must be at least 3 characters'],
            max: [25, 'Username can not exceed 25 characters'],
        },
        email: {
            type: String,
            unique: true,
            required: [true, 'Email is required'],
            max: [50, 'Email can not exceed 50 characters'],
            lowercase: true,
            trim: true,
            validate(value: string) {
                if (!validator.isEmail(value)) {
                    throw new Error('Please enter a valid E-mail!');
                }
            },
        },
        avatar: {
            type: String,
            default:
                'https://www.pngitem.com/pimgs/m/150-1503945_transparent-user-png-default-user-image-png-png.png',
        },
        coverPicture: { type: String, default: '' },
        bio: { type: String, default: '' },
        password: {
            type: String,
            required: [true, 'Password is required'],
            validate(value: string) {
                if (!validator.isLength(value, { min: 6, max: 1000 })) {
                    throw Error(
                        'Length of the password should be between 6-1000'
                    );
                }
                if (value.toLowerCase().includes('password')) {
                    throw Error(
                        'The password should not contain the keyword "password"!'
                    );
                }
            },
        },
        dateOfBirth: {
            type: Date,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        tokenVersion: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

UserSchema.methods.toJSON = function () {
    const userObj = { ...this._doc };
    delete userObj.password;
    delete userObj.__v;

    return userObj;
};

UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        try {
            const hashPassword = await bcrypt.hash(this.password, 12);
            this.password = hashPassword;
            next();
        } catch (err) {
            next(new Error('Could not create user, please try again.'));
        }
    }
    next();
});

UserSchema.methods.comparePassword = async function (
    password: string
): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
};

export default model<User>('User', UserSchema);
