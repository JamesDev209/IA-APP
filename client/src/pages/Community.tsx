import { useEffect, useState } from "react";
import type { Project } from "../types";
import { dummyGenerations } from "../assets/assets";
import { Loader2Icon } from "lucide-react";
import ProjectCard from "../components/ProjectCard";

export const Community = () => {

    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchProjects = async() => {
      setLoading(true);
      setTimeout(() =>{
        const formattedProjects = dummyGenerations.map((project) => ({
          ...project,
          uploadImages: project.uploadedImages,
          createdAt: new Date(project.createdAt).toLocaleDateString(),
          updatedAt: new Date(project.updatedAt).toLocaleDateString(),
        }));
        setProjects(formattedProjects);
        setLoading(false);
      },2000)
    }

    useEffect(() => {
      fetchProjects();
    },[])
  

    return loading? (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2Icon className="animate-spin size-7 text-indigo-400"/>
      </div>
  ) : (
      <div className="min-h-screen text-white p-6 md:p-12 my-28">
        <div className="max-w-6x1 mx-auto">
          <header className="mb-12">
            <h1 className="text-3xl md:text-4xl font-semibold mb-4">Community</h1>
            <p className=" text-gray-400">
              Discover and share your AI-generated art with the community.
            </p>
          </header>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4"> 
            {projects.map((project )=>(
              <ProjectCard key={project.id} gen={project} setGenerations={setProjects} forCommunity={true}/>
            ))}
          </div>
        </div>
      </div>
  )
}