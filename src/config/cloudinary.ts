import { v2 } from 'cloudinary';
import { NextFunction, Request, Response } from 'express';

const { config, uploader } = v2;

const cloudinaryConfigMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    next();
};

export { cloudinaryConfigMiddleware, uploader };
