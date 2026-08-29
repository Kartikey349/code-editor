import { createClient } from "redis";

const client = createClient()
await client.connect().then(async() => {
    while(true){
        await client.rPop("problems")
    }

})

