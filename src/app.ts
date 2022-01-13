import express, { Application } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';

import Controller from '@/utils/interfaces/controller.interface';
import errorMiddleware from './middleware/error.middleware';
import notFoundMiddleware from './middleware/404.middleware';
import deserializeUser from './middleware/deserializeUser.middleware';

class App {
    private app: Application;
    private port: number;

    constructor(controllers: Controller[], port: number) {
        this.app = express();
        this.port = port;

        this.initializeDatabaseConnection();
        this.initializeMiddleware();
        this.initializeControllers(controllers);
        this.initializeErrorHandling();
    }

    private initializeDatabaseConnection() {
        const { MONGODB_URI } = process.env;
        mongoose
            .connect(MONGODB_URI as string)
            .then(() => {
                console.log('Database connection established');
            })
            .catch((error) => {
                console.log('Database connection error', error);
            });
    }

    private initializeMiddleware(): void {
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(morgan('dev'));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(deserializeUser);
    }

    private initializeControllers(controllers: Controller[]) {
        controllers.forEach((controller) => {
            this.app.use('/api', controller.router);
        });
    }

    private initializeErrorHandling() {
        this.app.use(notFoundMiddleware);
        this.app.use(errorMiddleware);
    }

    public listen(): void {
        this.app.listen(this.port, () => {
            console.log(`listening on port ${this.port}`);
        });
    }
}

export default App;
