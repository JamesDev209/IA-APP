import type React from "react";


export interface UploadZoneProps  {
    label: string;
    file: File | null;
    onClear: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
}

export interface User {
    id?:string;
    name?:string;
    email?:string;
}

export interface Project {
    id: string;
    name?:string;
    userId?:string;
    user?:User;
    productName?:string;
    productDescription?:string;
    targetLength?:number;
    productImage?:File | null;
    modelImage?:File | null;
    userPrompt?:string;
    aspectRatio?:string;
    isGenerating?:boolean;
    generatedImage?:string;
    generatedVideo?:string;
    isPublished?:boolean;
    error?:string;
    createdAt:Date | string;
    updatedAt?:Date | string;
    uploadImages:string[];

}