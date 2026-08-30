import { useState } from "react";
import { Button } from "./components/ui/button";
import "./index.css";
import axios from "axios"
import Editor from "@monaco-editor/react";

export function App() {
  const [code, setCode] = useState("")
  const [status, setStatus] = useState("")
  const [output, setOutput] = useState("")
  const [language, setLanguge] = useState("cpp")

  async function pollBackend(submissionId: string){
    const response = await axios.get(`http://localhost:3001/submission/${submissionId}`)
    if(response.data.status !== "Processing"){
      setStatus(response.data.status)
      setOutput(response.data.output)
    }else{
      await new Promise((r) => setTimeout(r,3000));
      await pollBackend(submissionId)
    }
  }
  return (
    <div className="flex h-screen w-screen  overflow-hidden">
      <div className=" flex flex-col gap-2 w-1/2 h-screen bg-gray-950">
        <div className="flex justify-between p-2 pb-0">
          <div className="flex gap-1">
            <Button variant={language === "cpp" ? "destructive" : "outline"} onClick={() => {
              setLanguge("cpp")
            }}>cpp</Button>

            <Button variant={language === "js" ? "destructive" : "outline"}
            onClick={() => {
              setLanguge("js")
            }}>js</Button>

            <Button variant={language === "py" ? "destructive" : "outline"} onClick={() => {
              setLanguge("py")
            }}>python</Button>
          </div>
          <div>
             <Button onClick={async() => {
              setStatus("Processing")
              setOutput("")
              const response = await axios.post("http://localhost:3001/submission", {
                "code": code,
                "language": language
              })

              await pollBackend(response.data.id)
             }}>Submit</Button>
          </div>
        </div>
        <div className="h-full">
         <Editor
            height="100%"
            language={language === "cpp"
                            ? "cpp"
                            : language === "js"
                            ? "javascript"
                            : "python"
                    }
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value ?? "")}
        />
        </div>
      </div>
      <div className=" flex-1 h-screen p-4 bg-gray-400" >
        <div className="pb-2">
          Status: {status}
        </div>
        <div className="border-t-2 pt-2">
          {output}
        </div>
      </div>
    </div>
  );
}

export default App;
