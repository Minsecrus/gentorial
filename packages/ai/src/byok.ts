import { createGenerationPipeline } from './pipeline.js'
import type {
  CompiledPrompt,
  Generator,
  ProviderAdapter,
  TransportContext
} from './types.js'

export type BrowserByokProvider = 'openai' | 'anthropic' | 'google' | 'custom'

export type BrowserByokCredentials = {
  provider: BrowserByokProvider
  apiKey: string
  model?: string
  endpoint?: string
}

export type BrowserByokGeneratorOptions = {
  fetch?: typeof globalThis.fetch
}

type BrowserRequest = {
  url: string
  headers: Record<string, string>
  body: unknown
}

const defaultModels: Record<Exclude<BrowserByokProvider, 'custom'>, string> = {
  openai: 'gpt-5-mini',
  anthropic: 'claude-sonnet-4-5',
  google: 'gemini-3.5-flash'
}

function cleanEndpoint(endpoint: string): string {
  return endpoint.trim().replace(/\/+$/u, '')
}

function parseJsonText(text: string): unknown {
  const trimmed = text.trim()
  const unfenced = trimmed.startsWith('```')
    ? trimmed.replace(/^```(?:json)?\s*/iu, '').replace(/\s*```$/u, '')
    : trimmed
  return JSON.parse(unfenced)
}

function responseText(value: unknown, provider: BrowserByokProvider): string {
  if (!value || typeof value !== 'object') throw new Error(`${provider} 返回了空响应`)
  const response = value as Record<string, unknown>

  if (provider === 'anthropic') {
    const content = Array.isArray(response.content) ? response.content : []
    const text = content.find((item) =>
      item && typeof item === 'object' && Reflect.get(item, 'type') === 'text'
    )
    const result = text && typeof text === 'object' ? Reflect.get(text, 'text') : undefined
    if (typeof result === 'string') return result
  } else if (provider === 'google') {
    const candidates = Array.isArray(response.candidates) ? response.candidates : []
    const parts = candidates[0] && typeof candidates[0] === 'object'
      ? Reflect.get(Reflect.get(candidates[0], 'content') ?? {}, 'parts')
      : undefined
    const first = Array.isArray(parts) ? parts[0] : undefined
    const result = first && typeof first === 'object' ? Reflect.get(first, 'text') : undefined
    if (typeof result === 'string') return result
  } else {
    const choices = Array.isArray(response.choices) ? response.choices : []
    const message = choices[0] && typeof choices[0] === 'object'
      ? Reflect.get(choices[0], 'message')
      : undefined
    const result = message && typeof message === 'object' ? Reflect.get(message, 'content') : undefined
    if (typeof result === 'string') return result
  }

  throw new Error(`${provider} 响应中没有可读取的结构化文本`)
}

function createAdapter(credentials: BrowserByokCredentials): ProviderAdapter<BrowserRequest, unknown> {
  const provider = credentials.provider
  const apiKey = credentials.apiKey.trim()
  if (!apiKey) throw new Error('API key 不能为空')

  if (provider === 'anthropic') {
    const model = credentials.model?.trim() || defaultModels.anthropic
    return {
      id: provider,
      createRequest(prompt: CompiledPrompt) {
        return {
          url: cleanEndpoint(credentials.endpoint || 'https://api.anthropic.com/v1/messages'),
          headers: {
            'content-type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          },
          body: {
            model,
            max_tokens: 8192,
            system: prompt.system,
            messages: [{ role: 'user', content: `${prompt.input}\n\n只输出一个 JSON 对象。` }]
          }
        }
      },
      readStructuredResult(response) {
        return parseJsonText(responseText(response, provider))
      }
    }
  }

  if (provider === 'google') {
    const model = credentials.model?.trim() || defaultModels.google
    const endpoint = credentials.endpoint?.trim()
      ? cleanEndpoint(credentials.endpoint)
      : `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`
    return {
      id: provider,
      createRequest(prompt: CompiledPrompt) {
        return {
          url: endpoint,
          headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
          body: {
            systemInstruction: { parts: [{ text: prompt.system }] },
            contents: [{ role: 'user', parts: [{ text: prompt.input }] }],
            generationConfig: { responseMimeType: 'application/json' }
          }
        }
      },
      readStructuredResult(response) {
        return parseJsonText(responseText(response, provider))
      }
    }
  }

  const model = credentials.model?.trim() || (provider === 'openai' ? defaultModels.openai : '')
  if (!model) throw new Error('OpenAI-compatible 提供方必须填写模型名称')
  const base = cleanEndpoint(credentials.endpoint || 'https://api.openai.com/v1')
  const url = base.endsWith('/chat/completions') ? base : `${base}/chat/completions`
  return {
    id: provider,
    createRequest(prompt: CompiledPrompt) {
      return {
        url,
        headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
        body: {
          model,
          messages: [
            { role: 'system', content: prompt.system },
            { role: 'user', content: prompt.input }
          ],
          response_format: { type: 'json_object' }
        }
      }
    },
    readStructuredResult(response) {
      return parseJsonText(responseText(response, provider))
    }
  }
}

function createBrowserTransport(fetchImplementation: typeof globalThis.fetch) {
  return {
    async send(request: BrowserRequest, context: TransportContext): Promise<unknown> {
      const response = await fetchImplementation(request.url, {
        method: 'POST',
        headers: request.headers,
        body: JSON.stringify(request.body),
        ...(context.signal ? { signal: context.signal } : {})
      })
      if (!response.ok) {
        let detail = ''
        try {
          const payload = await response.json() as Record<string, unknown>
          const error = payload.error
          detail = error && typeof error === 'object' && typeof Reflect.get(error, 'message') === 'string'
            ? `：${Reflect.get(error, 'message')}`
            : ''
        } catch {
          detail = ''
        }
        throw new Error(`${context.providerId} 请求失败（HTTP ${response.status}）${detail}`)
      }
      return response.json()
    }
  }
}

export function createBrowserByokGenerator(
  credentials: BrowserByokCredentials,
  options: BrowserByokGeneratorOptions = {}
): Generator {
  const fetchImplementation = options.fetch ?? globalThis.fetch
  if (!fetchImplementation) throw new Error('当前环境不支持 fetch')
  return createGenerationPipeline({
    adapter: createAdapter(credentials),
    transport: createBrowserTransport(fetchImplementation)
  })
}
