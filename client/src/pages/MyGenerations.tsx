import { useState, useEffect } from "react";
import { dummyGenerations } from "../assets/assets";
import type { Project } from "../types";
import { Loader2Icon } from "lucide-react";
import ProjectCard from "../components/ProjectCard";
import { PrimaryButton } from "../components/Buttons";


export const MyGenerations = () => {

  const [generations, setGenerations] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGenerations = async () => {
    setLoading(true);
    setTimeout(() => {
      const formattedProjects = dummyGenerations.map((project) => ({
        ...project,
        uploadImages: project.uploadedImages,
        createdAt: new Date(project.createdAt).toLocaleDateString(),
        updatedAt: new Date(project.updatedAt).toLocaleDateString(),
      }));
      setGenerations(formattedProjects);
      setLoading(false);
    }, 2000)
  }

  useEffect(() => {
    fetchGenerations();
  }, [])

  return loading ? (
    <div className="absolute insert-0 w-full h-full flex flex-col items-center justify-center bg-black/20">
      <Loader2Icon className="size-7 animate-spin" />
    </div>
  ) : (
    <div className="min-h-screen text-white p-6 md:p-12 my-28">
        <div className="max-w-6x1 mx-auto">
          <header className="mb-12">
            <h1 className="text-3xl md:text-4xl font-semibold mb-4">My Generations</h1>
            <p className=" text-gray-400">
              Viwe & manage your IA-generated content
            </p>
          </header>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4"> 
            {generations.map((gen )=>(
              <ProjectCard key={gen.id} gen={gen} setGenerations={setGenerations}/>
            ))}
          </div>

          {generations.length === 0 && (
            <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10 text-gray-400">
              <h3 className="text-lg font-medium mb-2">No generations found.</h3>
              <p className="text-gray-400 mb-6">Start creating staning producs photos today</p>
              <PrimaryButton onClick={() => window.location.href = '/generate'}>
                Create a new generation
              </PrimaryButton>
            </div>
          )}
        </div>
      </div>
  )
}
