import type { Provider } from '@gentorial/server'

export type GentorialManagedServerConfig = {
  /** Provider used by learners who have not enabled BYOK. */
  provider: Provider
  /** Provider model name. */
  model: string
  /** Optional provider base URL, required for provider: 'custom'. */
  baseUrl?: string
  /** Name of the server-only environment variable containing the API key. */
  apiKeyEnv: string
  /** Increment this whenever prompts, parameters, or the output contract change. */
  profileRevision: string
  /** Local server port. VitePress's development proxy follows this value. */
  port: number
  cache: {
    /** Persistent single-server cache directory. */
    directory: string
    /** Shared result lifetime. */
    ttlMs: number
  }
}

const config: GentorialManagedServerConfig = {
  provider: 'openai',
  model: 'gpt-5.1',
  apiKeyEnv: 'OPENAI_API_KEY',
  profileRevision: 'prompt-v1:lesson-v1',
  port: 8787,
  cache: {
    directory: '.gentorial/cache',
    ttlMs: 7 * 24 * 60 * 60 * 1000
  }
} satisfies GentorialManagedServerConfig

export default config
