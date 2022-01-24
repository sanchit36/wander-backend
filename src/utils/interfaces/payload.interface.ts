import { JwtPayload } from 'jsonwebtoken';

export default interface PayloadJwt extends JwtPayload {
    userId: string;
    email: string;
    tokenVersion?: number;
}
