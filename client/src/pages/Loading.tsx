import { Loader2Icon } from "lucide-react"
import { useEffect } from "react"


export const Loading = () => {

  useEffect(() =>{
    setTimeout(()=>{
      window.location.href = '/'
    }, 6000)
  })


  return (
    <div className="h-screen felx flex-col"> 
        <div className="flex items-center justify-center fñex-1">
            <Loader2Icon className="size-7 text-indigo-200 animate-spin"/>
        </div>
    </div>
  )
}
