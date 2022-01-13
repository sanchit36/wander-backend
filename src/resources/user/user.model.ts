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
            min: 3,
        },
        email: {
            type: String,
            unique: true,
            required: [true, 'Email is required'],
            min: 3,
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
        bio: {
            type: String,
            default: '',
        },
        password: {
            type: String,
            select: false,
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
    const user = this as User;
    if (!user.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
    return next();
});

UserSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    const user = this as User;
    return bcrypt.compare(candidatePassword, user.password).catch((e) => false);
};

export default model<User>('User', UserSchema);
