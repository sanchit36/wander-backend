import { cleanEnv, str, port } from 'envalid';

function validateEnv(): void {
    cleanEnv(process.env, {
        NODE_ENV: str({ choices: ['development', 'production'] }),
        MONGODB_URI: str(),
        PORT: port({ default: 3000 }),
        ACCESS_TOKEN_SECRET: str(),
        VERIFY_TOKEN_SECRET: str(),
        REFRESH_TOKEN_SECRET: str(),
        SALT_WORK_FACTOR: str(),
        ACCESS_TOKEN_TTL: str(),
        VERIFY_TOKEN_TTL: str(),
        REFRESH_TOKEN_TTL: str(),
    });
}

export default validateEnv;
