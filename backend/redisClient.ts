import { createClient } from "redis";

export const client = createClient({
  url: "redis://localhost:6379"
})

