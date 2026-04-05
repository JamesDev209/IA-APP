import { Request, Response } from "express";
import * as Sentry from "@sentry/node";
import { prisma } from "../configs/prisma";
import { v2 as cloudinary } from 'cloudinary';
import { GenerateContentConfig, HarmBlockThreshold, HarmCategory } from "@google/genai";
import path from "path";
import fs from "fs";
import { text } from "stream/consumers";
import ai from "../configs/ai";
import axios from "axios";
import upload from "../configs/multer";


const loadImage = (path: string, mimeType: string) => {
    return {
        inlineData: {
            data: fs.readFileSync(path).toString('base64'),
            mimeType,
        }
    }
}

export const createProject = async (req: Request, res: Response) => {

    let tempProjectId: string;
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
        const img2base64 = loadImage(images[1].path, images[1].mimeType); 7

        const prompt = {
            text: `Combine the person and product into a ealist photo make person naturally hold use the product.
            Match lighting shadows, scale and perspective.
            Make the person stand in the profesional studio lighting.
            Output ecommerce-quality pho realistic imagery ${userPrompt}`
        }

        //generate the iiamge using ai model
        const response: any = await ai.models.generateContent({
            model,
            contents: [img1base64, img2base64, prompt],
            config: generationConfig
        });

        //chek if the respuesta is valid..

        if (!response.canditates?.[0]?.content?.parts) {
            throw new Error('Invalid response from AI model');
        }

        const parts = response.canditates[0].content.parts;
        let finalBuffer: Buffer | null = null

        for (let part of parts) {
            if (part.inlineData?.data?.length) {
                finalBuffer = Buffer.from(part.inlineData.data, 'base64')
            }
        }

        if (!finalBuffer) {
            throw new Error('failed generate image');
        }

        const base64Image = `data:/image/png;base64,${finalBuffer.toString('base64')}`
        const uploadResult = await cloudinary.uploader.upload(base64Image, { resource_type: 'image' });

        await prisma.project.update({
            where: {
                id: project.id
            },
            data: {
                generatedImage: uploadResult.secure_url,
                isGenerating: false
            }
        })
        res.json({ projectId: project.id });

    } catch (error: any) {
        if (tempProjectId!) {
            //upload project status and error message

            await prisma.project.update({
                where: {
                    id: tempProjectId
                },
                data: {
                    isGenerating: false, error: error.message
                }
            })
        }
        if (isCreditDeducted) {
            //add credits back
            await prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    credits: {
                        increment: 5
                    }
                }
            })
        }

        Sentry.captureException(error);
        res.status(500).json({ message: error.code || error.message })
    }
}

export const createVideo = async (req: Request, res: Response) => {
    const { userId } = req.auth();
    const { projectId } = req.body;
    const isCreditDeducted = false;

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })
    if (!user || user.credits < 10) {
        res.status(400).json({ message: 'Insufficient credits' })
    }

    //deduct credits for video generation
    await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            credits: {
                decrement: 10
            }
        }
    }).then(() => { isCreditDeducted })

    try {
        const project = await prisma.project.findUnique({
            where: {
                id: projectId
            },
            include: {
                user: true
            }
        })

        if (!project || project.isGenerating) {
            return res.status(400).json({ message: 'Generating in progress' })
        }

        if (project.generatedVideo) {
            return res.status(400).json({ message: 'video already generated' })
        }

        await prisma.project.update({
            where: {
                id: project.id
            },
            data: {
                isGenerating: true
            }
        });

        const prompt = `make the person showcase the product wich is ${project.productName} ${project.productDescription && `and product Description: ${project.productDescription}`}`

        const model = 'veo-3.1-generate-preview'

        if (!project.generatedImage) {
            throw new Error('Generate image not found')
        }

        const image = await axios.get(project.generatedImage, { responseType: 'arraybuffer' });

        const imagesBytes: any = Buffer.from(image.data)

        let operation: any = await ai.models.generateVideos({
            model,
            prompt,
            image: {
                imageBytes: imagesBytes.toString('base64'),
                mimeType: 'image/png'
            },
            config: {
                aspectRatio: project?.aspectRatio || '9:16',
                numberOfVideos: 1,
                resolution: '720',
            }
        })

        while (!operation.done) {
            console.log('warning for video duration to complete..');
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation: operation })
        }

        const filename = `${userId}-${Date.now()}.mp4`;
        const filePath = path.join('videos', filename);

        //create the images directory if  dosent exist
        fs.mkdirSync('videos', { recursive: true })
        if (!operation.response.generatedVideos) {
            throw new Error(operation.response.raiMediaFilteredReasons[0])
        }

        //donwload the video
        await ai.files.download({
            file: operation.response.generatedVideos[0].video,
            downloadPath: filePath
        })

        const uploadResult = await cloudinary.uploader.upload(filePath, {
            resource_type: 'video'
        })

        await prisma.project.update({
            where: { id: project.id },
            data: {
                generatedVideo: uploadResult.secure_url,
                isGenerating: false
            }
        })

        //remove video file from disk after upload
        fs.unlinkSync(filePath);

        res.json({ message: 'Video generated completed.', videoUrl: uploadResult.secure_url })
    } catch (error: any) {


        await prisma.project.update({
            where: {
                id: projectId, userId
            },
            data: {
                isGenerating: false, error: error.message
            }
        })

        if (isCreditDeducted) {
            //add credits back
            await prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    credits: {
                        increment: 10
                    }
                }
            })
        }

        Sentry.captureException(error);
        res.status(500).json({ message: error.code || error.message })
    }
}

export const getAllPublishedProjects = async (req: Request, res: Response) => {
    try {
        const projects = await prisma.project.findMany({
            where: {
                isPublished: true
            }
        })
        res.json({ projects })
    } catch (error: any) {
        Sentry.captureException(error);
        res.status(500).json({ message: error.code || error.message })
    }
}

export const deleteProject = async (req: Request, res: Response) => {
    try {
        const { userId } = req.auth();
        const { projectId: id } = req.params;
        const projectId = Array.isArray(id) ? id[0] : id;
        if (!projectId) {
            return res.status(400).json({ message: 'Project ID is required' });
        }
        const project = await prisma.project.findUnique({
            where: {
                id: projectId, userId
            }
        })
        if (!project) {
            return res.status(400).json({ message: 'Project not found' })
        }
        await prisma.project.delete({
            where: {
                id: projectId,
            }
        })
        res.json({ message: 'Project deleted' })
    } catch (error: any) {
        Sentry.captureException(error);
        res.status(500).json({ message: error.code || error.message })
    }
}