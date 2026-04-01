import * as Sentry from "@sentry/node";
import { Request, Response, NextFunction } from "express";

export const protect = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.auth();
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
        }
    } catch (error: any) {
        Sentry.captureException(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
