import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.string().url().default('https://api.creovine.com'),
  VITE_WS_URL: z.string().default('wss://api.creovine.com/lira/v1/ws'),
  MODE: z.string().default('development'),
})

export const env = envSchema.parse({
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_WS_URL: import.meta.env.VITE_WS_URL,
  MODE: import.meta.env.MODE,
})
