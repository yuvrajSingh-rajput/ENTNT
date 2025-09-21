// MSW setup for Next.js
import { initializeMSW } from "./msw"
import { DatabaseService } from "./db"

if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  DatabaseService.initialize().then(() => {
    initializeMSW()
  }).catch((error) => {
    console.error("Failed to initialize database:", error)
  })
}

export { initializeMSW }
