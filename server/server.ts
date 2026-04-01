import './configs/instrument.mjs';
import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";
import 'dotenv/config';
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from "./controllers/clerk";
import * as Sentry from "@sentry/node";
import userRouter from './routes/userRouter';


const app = express();

// Middleware
app.use(cors())

app.post('/api/clerk', express.raw({ type: 'application/json' }), clerkWebhooks)
app.use(express.json());
app.use(clerkMiddleware())

const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});

app.get("/debug-sentry", function mainHandler(req, res) {
    throw new Error("My first Sentry error!");
});

app.use('/api/user', userRouter)
// The error handler must be registered before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
