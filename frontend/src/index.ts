import { serve } from "bun";
import index from "./index.html";


// console.log(`🚀 Server running at ${server.url}`);

Bun.serve({
    routes: {
        "/*": index,
    },
    development: true,
});

console.log("Server running at http://localhost:3000");