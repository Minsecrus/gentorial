import { defaultPromptCompiler } from './prompt.js'
import type { GeneratedLesson } from '@gentorial/core'
import type {
  GenerationPipelineOptions,
  Generator
} from './types.js'

export function createGenerationPipeline<TRequest, TResponse>(
  options: GenerationPipelineOptions<TRequest, TResponse>
): Generator {
  const compiler = options.compiler ?? defaultPromptCompiler

  return {
    async generate(input, context = {}) {
      const prompt = compiler.compile(input)
      const request = options.adapter.createRequest(prompt)
      const response = await options.transport.send(request, {
        ...context,
        providerId: options.adapter.id
      })
      return options.adapter.readStructuredResult(response) as GeneratedLesson
    }
  }
}

export const createRemoteGenerator = createGenerationPipeline
