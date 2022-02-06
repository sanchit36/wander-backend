import path from 'path';

import multer from 'multer';
import DatauriParser from 'datauri/parser';

import { uploader } from '../config/cloudinary';
import { NextFunction, Request, Response } from 'express';

const MIME_TYPE_MAP: { [key: string]: string } = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
};

const storage = multer.memoryStorage();

const parser = new DatauriParser();

const fileUpload = multer({
    limits: { fileSize: 500000 },
    storage,
    fileFilter: (req, file, callback) => {
        const isValid = !!MIME_TYPE_MAP[file.mimetype];
        const error = isValid ? null : new Error('Invalid file type');
        if (error) callback(error);
        else callback(null, isValid);
    },
});

const dataUri = (file: Express.Multer.File) => {
    if (file) {
        return parser.format(
            path.extname(file.originalname).toString(),
            file.buffer
        );
    }
    throw new Error('Invalid file');
};

const getPublicIdForUrl = (url: string) => {
    try {
        const x = url.split('/');
        const id = x[x.length - 1].split('.')[0];
        return id;
    } catch (err) {
        throw new Error('image id not found');
    }
};

const helper = async (file: string) => {
    try {
        const result = await uploader.upload(file);
        const image = result.url;
        return image;
    } catch (err) {
        new Error('Could not upload image, try again.');
    }
};

const uploadToCloud = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (req.files) {
        const images = [];
        for (const [key, value] of Object.entries(req.files)) {
            const file = dataUri(value[0]).content;
            if (file) {
                const imageUrl = await helper(file);
                images.push(imageUrl);
                req.body[key] = imageUrl;
            }
        }

        return next();
    } else {
        return next();
    }
};

export { fileUpload, uploadToCloud, getPublicIdForUrl };
