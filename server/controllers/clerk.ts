import { Request, Response } from "express";
import { verifyWebhook } from '@clerk/express/webhooks'
import { prisma } from "../configs/prisma";

const clerkWebhooks = async (req: Request, res: Response) => {
try {
    const evt = await verifyWebhook(req)
    //Gueting data from request
    const { data, type } = evt;

    //Checking if the event is a user sign up

    switch (type) {
        case 'user.created':{
            await prisma.user.create({
                data: {
                    id: data.id,
                    email: data?.email_addresses[0]?.email_address,
                    name: data?.first_name + " " + data?.last_name,
                    image: data?.image_url,
                },
            })
            break;
        }

        case 'user.updated':{
            await prisma.user.update({
                where:{
                    id:data.id
                },
                data: {
                    id: data.id,
                    email: data?.email_addresses[0]?.email_address,
                    name: data?.first_name + " " + data?.last_name,
                    image: data?.image_url,
                },
            })
            break;
        }

        
        case 'user.deleted':{
            await prisma.user.delete({ where:{id:data.id}})
            break;
        }
            
            break;
        default:
            console.log('Other event');
            break;
    }
} catch (error) {
    
}
}