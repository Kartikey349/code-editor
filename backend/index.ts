import express from "express"
const app = express()
import { client } from "./redisClient"

await client.connect();

app.use(express.json())

app.post("/submission", async (req,res)=> {
    const code = req.body.code;
    const language = req.body.language;

    await client.lPush("problems", JSON.stringify({
        code,
        language
    }))

    res.json({
        message: "processing"
    })
})
app.get("/submission/:submissinId", (req,res)=> {
    res.send("hello")
})

app.listen(3000)