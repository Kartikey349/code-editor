import { spawn } from "child_process";
import { createClient } from "redis";
import fs from "fs"

const client = createClient()
await client.connect().then(async() => {
    while(true){
        const response = await client.rPop("problems")

        if(!response){
            await new Promise((r) => {
                setTimeout(r,1000)
            })
            continue;
        }
        
        const parsedResponse = JSON.parse(response)
        const code = parsedResponse.code;
        const language = parsedResponse.language

        if(language === "cpp"){
            const filePath = __dirname + "\\code\\a.cpp";
            const outputPath = __dirname + "\\code\\out.exe";

            console.log("Processing cpp code");

            fs.writeFileSync(filePath, code)

            const compiled = spawn("g++", [filePath, "-o",outputPath])

            await new Promise((r) => setTimeout(r,2000));
            const child = spawn(outputPath)
            child.stdout.on("data", (chunk) => {
                console.log(chunk.toString())
            })
        }

        if(language === "py"){
            const filePath= __dirname + "\\code\\a.py"
            // console.log("Processing py code");
            fs.writeFileSync(filePath, code)
            const child = spawn("python", [filePath!] )
            child.stdout.on("data", (chunk) => {
                console.log(chunk.toString())
            })
        }

        if(language === "js"){
            const filePath= __dirname + "\\code\\a.js"
            console.log("Processing js code");
            fs.writeFileSync(filePath, code)
            const child = spawn("node", [filePath!] )
            child.stdout.on("data", (chunk) => {
                console.log(chunk.toString())
            })
        }
    }

})

