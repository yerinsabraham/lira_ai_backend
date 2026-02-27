import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.string().url().default('https://api.creovine.com'),
  VITE_WS_URL: z.string().default('wss://api.creovine.com/lira/v1/ws'),
  /** Tenant-level API key — configured once at deploy time, transparent to end users */
  VITE_API_KEY: z.string().default(''),
  MODE: z.string().default('development'),
})

export const env = envSchema.parse({
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_WS_URL: import.meta.env.VITE_WS_URL,
  VITE_API_KEY: import.meta.env.VITE_API_KEY,
  MODE: import.meta.env.MODE,
})
