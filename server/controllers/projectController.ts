import { Request, Response } from "express";
import * as Sentry from "@sentry/node";
import { prisma } from "../configs/prisma";
import { v2 as cloudinary } from 'cloudinary';
import { GenerateContentConfig, HarmBlockThreshold, HarmCategory } from "@google/genai";
import path from "path";
import fs from "fs";
import { text } from "stream/consumers";
import ai from "../configs/ai";


const loadImage = (path: string, mimeType: string) => {
    return {
        inlineData: {
            data: fs.readFileSync(path).toString('base64'),
            mimeType,
        }
    }
}

export const createProject = async (req: Request, res: Response) => {

    let tempProjectId: String
    const { userId } = req.auth();
    let isCreditDeducted = false;

    const { name = 'New project', aspectRatio, userPrompt, productName, productDescription, targetLength } = req.body;

    const images: any = req.files;
    if (images.length < 2 || !productName) {
        return res.status(400).json({ message: 'Please upload at least 2 images and provide a product name' })
    }
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })

    if (!user || user.credits < 5) {
        return res.status(400).json({ message: 'Insufficient credits' })
    } else {
        //deduct credic for image generation
        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                credits: { decrement: 5 }
            }
        }).then(() => { isCreditDeducted = true })

    }

    try {

        let uploadedImages = await Promise.all(
            images.map(async (item: any) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url;
            })
        )

        const project = await prisma.project.create({
            data: {
                name,
                userId,
                aspectRatio,
                userPrompt,
                productName,
                productDescription,
                targetLength: parseInt(targetLength),
                uploadedImages,
                isGenerating: true
            }
        });

        tempProjectId = project.id;

        const model = "gemini-3.1-pro-image-preview";
        const generationConfig: GenerateContentConfig = {
            maxOutputTokens: 32768,
            temperature: 1,
            topP: 0.95,
            responseModalities: ['IMAGE'],
            imageConfig: {
                aspectRatio: aspectRatio || '9:16',
                imageSize: '1K'
            },
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.OFF,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: HarmBlockThreshold.OFF,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: HarmBlockThreshold.OFF,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.OFF,
                },
            ]
        }

        //image to base64 structure for ai 
        const img1base64 = loadImage(images[0].path, images[0].mimeType);
        const img2base64 = loadImage(images[1].path, images[1].mimeType);7

        const prompt = {
            text: `COmbine the person and product into a ealist photo make person naturally hold use the product.
            Match lighting shadows, scale and perspective.
            Make the person stand in the profesional studio lighting.
            Output ecommerce-quality pho realistic imagery ${userPrompt}`
        }

        //generate the iiamge using ai model
        const response: any = await ai.models.generateContent({
            model,
            contents: [img1base64, img2base64, prompt]
        })


    } catch (error: any) {
        Sentry.captureException(error);
        res.status(500).json({ message: error.code || error.message })
    }
}

export const createVideo = async (req: Request, res: Response) => {
    try {

    } catch (error: any) {
        Sentry.captureException(error);
        res.status(500).json({ message: error.code || error.message })
    }
}

export const getAllPublishedProjects = async (req: Request, res: Response) => {
    try {

    } catch (error: any) {
        Sentry.captureException(error);
        res.status(500).json({ message: error.code || error.message })
    }
}

export const deleteProject = async (req: Request, res: Response) => {
    try {

    } catch (error: any) {
        Sentry.captureException(error);
        res.status(500).json({ message: error.code || error.message })
    }
}