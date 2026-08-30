import express from "express"
const app = express()
import { client } from "./redisClient"
import { prisma } from "./db";
import cors from "cors"

await client.connect();

app.use(cors({
    origin: "http://localhost:3000",
     methods: 'GET,POST,PUT,DELETE'
}))
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
app.get("/submission/:submissinId", async (req,res)=> {
    const response = await prisma.submission.findFirst({
        where:{
            id: req.params.submissinId
        }
    })
    res.json({
        output: response?.output,
        status: response?.status
    })
})


prisma.$connect().then(() => {
    console.log("Connected to DB")

    app.listen(3001, () => {
        console.log("listening to port 3001")
    })
})