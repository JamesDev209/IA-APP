import { useState } from "react";
import Title from "../components/Title";
import UploadZone from "../components/UploadZone";
import { PrimaryButton } from "../components/Buttons";
import { Loader2Icon, Wand2Icon } from "lucide-react";
import { useAuth, useUser } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../configs/axios";

export const Genetator = () => {

  const { user } = useUser()
  const {getToken} = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState("");
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [modelImage, setModelImage] = useState<File | null>(null);
  const [userPrompt, setUserPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "product" | "model"
  ) => {
    if (e.target.files && e.target.files[0]) {

      if (type === "product") 
        setProductImage(e.target.files[0]);
        else setModelImage(e.target.files[0]);
    } 
  };

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!user) return toast.error("Please login first")
    
    if(!productImage || !modelImage || !name || !productName)   return toast.error("Please upload product and model images")  

      try {
        setIsGenerating(true)
        const formData = new FormData()

        formData.append("name", name)
        formData.append("productName", productName)
        formData.append("productDescription", productDescription)
        formData.append("productImage", productImage)
        formData.append("images", productImage)
        formData.append("images", modelImage)
        formData.append("userPrompt", userPrompt) 

        const token = await getToken()

        const { data } = await api.post('/api/project/create', formData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        toast.success(data.message);
        navigate('/result/' + data.projectId)

      } catch (error: any) {
        setIsGenerating(false)
        toast.error(error?.response?.data?.message || error.message )
      }
  };

  return (
    <div className="min-h-screen text-white p-6 md:p-12 mt-28">
      <form onSubmit={handleGenerate} className="max-w-4xl mx-auto mb-40">

        <Title
          heading="Create in context"
          description="Upload your model"
        />

        <div className="flex gap-20 max-sm:flex-col items-start justify-between">

          <div className="flex flex-col w-full sm:max-w-60 gap-8 mt-8 mb-12">
            <UploadZone
            label="Product image"
            file={productImage}
            onClear={() => setProductImage(null)}
            onChange={(e) => handleFileChange(e, 'product')}
          />   
          <UploadZone
            label="Model image"
            file={modelImage}
            onClear={() => setModelImage(null)}
            onChange={(e) => handleFileChange(e, 'model')}
          />
          </div>
          
          <div className="w-full">
            
          <div className="mb-4">
              <label htmlFor="name" className="block text-sm mb-4">
                </label>
                <input type="text"  id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name your project" required className="w-full bg-white/3 rounded-lg border-2 p-4 text-sm borde-violet-200/10 focus:border-violet-500/50 outline-none transition-all"/>
          </div>
        

            <div className="mb-4 text-gray-300">
              <label htmlFor="productName" className="block text-sm mb-4">
                </label>
                <input type="text"  id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Enter of name of the product" required className="w-full bg-white/3 rounded-lg border-2 p-4 text-sm borde-violet-200/10 focus:border-violet-500/50 outline-none transition-all"/>
          </div>

          <div className="mb-4 text-gray-300">
              <label htmlFor="productDescription" className="block text-sm mb-4">
                Product description <span className="text-xs text-violet-400">(optional)</span>
                </label>

                <textarea name="" id="productDescription" rows={4} value={productDescription} onChange={(e) =>setProductDescription(e.target.value)} placeholder="Enter the description of product" className="w-full bg-white/3 rounded-lg border-2 p-4 text-sm border-violet-200/10 focus:border-violet-500/50 outline-none resize-none transition-all"></textarea>
          </div>

<hr className="" />
          
          <div className="mb-4 text-gray-300">
              <label htmlFor="userPromt" className="block text-sm mb-4">
                User prompt <span className="text-xs text-violet-400">(optional)</span>
                </label>

                <textarea name="" id="userPromt" rows={4} value={userPrompt} onChange={(e) =>setUserPrompt(e.target.value)} placeholder="Describe how you want the narration to be." className="w-full bg-white/3 rounded-lg border-2 p-4 text-sm border-violet-200/10 focus:border-violet-500/50 outline-none resize-none transition-all"></textarea>
          </div>
          </div>
        </div>

        <div className="flex justify-center mt-0">
            <PrimaryButton disabled={isGenerating} className="px-10 py-3 rounded-md disabled:opacity-70 disabled:cursor-not-allowed">
              {isGenerating ? (
                <>
              <Loader2Icon className="size-5 animate-spin"/> Generating
              </>) : (
                <>
                  <Wand2Icon className="size-5"/> Generate Image  
                </>
              )}
            </PrimaryButton>
        </div>
      </form>
    </div>
  );
};