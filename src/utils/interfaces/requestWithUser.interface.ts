import { Request } from 'express';
import PayloadJwt from './payload.interface';

export interface IGetUserAuthInfoRequest extends Request {
    locals: { user: PayloadJwt };
}
