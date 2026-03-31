

import { Request, Response, NextFunction } from "express";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.auth();
        if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        }
    } catch (error: any) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
