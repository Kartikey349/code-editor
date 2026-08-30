import express from "express"
const app = express()
import { client } from "./redisClient"
import { prisma } from "./db";

await client.connect();

app.use(express.json())

app.post("/submission", async (req,res)=> {
    const code = req.body.code;
    const language = req.body.language;

    const response = await prisma.submission.create({
        data: {
            code,
            language,
            status: "Processing"
        }
    })

    await client.lPush("problems", JSON.stringify({
        code,
        language,
        submissonId : response.id
    }))

    res.json({
        message: "processing",
        id: response.id
    })
})
app.get("/submission/:submissinId", (req,res)=> {
    res.send("hello")
})


prisma.$connect().then(() => {
    console.log("Connected to DB")

    app.listen(3001, () => {
        console.log("listening to port 3001")
    })
})