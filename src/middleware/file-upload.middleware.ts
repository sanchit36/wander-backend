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

const dataUri = (req: Request) => {
    if (req.file) {
        return parser.format(
            path.extname(req.file.originalname).toString(),
            req.file.buffer
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

const uploadToCloud = (req: Request, res: Response, next: NextFunction) => {
    console.log(req.file);
    console.log(req.files);
    if (req.file) {
        const file = dataUri(req).content;
        if (file) {
            uploader
                .upload(file)
                .then((result) => {
                    const image = result.url;
                    res.locals.image = image;
                    return next();
                })
                .catch((err) => {
                    return next(
                        new Error('Could not upload image, try again.')
                    );
                });
        }
    } else {
        next();
    }
};

export { fileUpload, uploadToCloud, getPublicIdForUrl };
