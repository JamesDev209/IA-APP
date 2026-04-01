
import { Request, Response } from "express";
import * as Sentry from "@sentry/node";

//Get user credicts
export const getUserCredits = async (req: Request, res: Response) => {
    try {


    } catch (error: any) {
        Sentry.captureException(error);
        res.status(500).json({ message: error.code || error.message })
    }
}

//  constget all projects
export const getUserProjects = async (req: Request, res: Response) => {
    try {


    } catch (error: any) {
        Sentry.captureException(error);
        res.status(500).json({ message: error.code || error.message })
    }
}

//get proyect by id
export const getProjectById = async (req: Request, res: Response) => {
    try {


    } catch (error: any) {
        Sentry.captureException(error);
        res.status(500).json({ message: error.code || error.message })
    }
}

//publish / un publish project
export const toggleProjectPublic = async (req: Request, res: Response) => {
    try {


    } catch (error: any) {
        Sentry.captureException(error);
        res.status(500).json({ message: error.code || error.message })
    }
}
