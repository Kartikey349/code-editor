import { spawn } from "child_process";
import { createClient } from "redis";
import fs from "fs"
import { prisma } from "./db";
import express from "express"

const app = express()

const executeProcess = async (
    command: string,
    args: string[],
    submissionId: string
) => {
    const child = spawn(command, args);

    let output = "";
    let error = "";

    child.stdout.on("data", (chunk) => {
        output += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
        error += chunk.toString();
    });

    const exitCode = await new Promise<number>((resolve, reject) => {
        child.on("close", (code) => {
            resolve(code ?? 1);
        });

        child.on("error", (err) => {
            reject(err);
        });
    });

    if (exitCode === 0) {
        await prisma.submission.update({
            where: {
                id: submissionId
            },
            data: {
                status: "Success",
                output: output
            }
        });
    } else {
        await prisma.submission.update({
            where: {
                id: submissionId
            },
            data: {
                status: "Failed",
                output: error
            }
        });
    }
};

export const client = createClient({
  url: process.env.REDIS_URL
});
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
        const submissionId =  parsedResponse.submissonId
        let finalOutput = ""

    if (language === "cpp") {

        const filePath = __dirname + `\\code\\${submissionId}.cpp`;
        const outputPath = __dirname + `\\code\\${submissionId}.exe`;

        fs.writeFileSync(filePath, code);

        // Compile
        const compiler = spawn("g++", [
            filePath,
            "-o",
            outputPath
        ]);

        let compileError = "";

        compiler.stderr.on("data", (chunk) => {
            compileError += chunk.toString();
        });
        
        const compileExitCode = await new Promise<number>((resolve) => {
            compiler.on("close", (code) => {
                resolve(code ?? 1);
            });
        });

        compileError = compileError.replace(
            /.*\\([^\\]+\.cpp)/g,
            "$1"
        );
        
        if (compileExitCode !== 0) {
            console.log(compileError)

            await prisma.submission.update({
                where: {
                    id: submissionId
                },
                data: {
                    status: "Failed",
                    output: compileError
                }
            });

            continue;
        }

        await executeProcess(
            outputPath,
            [],
            submissionId
        );
    }

    if (language === "py") {

        const filePath = __dirname + `\\code\\${submissionId}.py`;

        fs.writeFileSync(filePath, code);

        await executeProcess(
            "python",
            [filePath],
            submissionId
        );
    }

    if (language === "js") {

        const filePath = __dirname + `\\code\\${submissionId}.js`;

        fs.writeFileSync(filePath, code);

        await executeProcess(
            "node",
            [filePath],
            submissionId
        );
    }
    }
})

app.listen(3002, "0.0.0.0", () => {
  console.log(`Worker running on 3002`);
});