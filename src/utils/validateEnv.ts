import { cleanEnv, str, port } from 'envalid';

function validateEnv(): void {
    cleanEnv(process.env, {
        NODE_ENV: str({ choices: ['development', 'production'] }),
        MONGODB_URI: str(),
        PORT: port({ default: 3000 }),
        ACCESS_TOKEN_SECRET: str(),
        REFRESH_TOKEN_SECRET: str(),
    });
}

export default validateEnv;
