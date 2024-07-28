import { usePageData } from "@/runtime";



export function PageContent(){
  const pageData  = usePageData()

  console.log(pageData)


  return <div>page</div>;



}
