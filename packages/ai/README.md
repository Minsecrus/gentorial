# `@gentorial/ai`

Gentorial 的提供方无关 AI 管线。该包负责编译提示、分离提供方适配与传输，并提供确定性 mock。

```ts
import { createMockGenerator } from '@gentorial/ai'

const generator = createMockGenerator()
const lesson = await generator.generate(input)
```

具体模型 SDK 不进入该包的核心路径；提供方格式由 `ProviderAdapter` 处理，请求去向由 `AITransport` 处理。概念、章节范围和学习者偏好会进入提示，但框架不判断生成内容是否正确，也不提供内容校验钩子。

将 `LessonConversationTurn[]` 放入 `GenerationInput.conversation` 即可围绕已有结果继续提问。每次后续回答都会收到原任务的章节范围、概念锚点和课程准确性策略。

默认包还提供 `createBrowserByokGenerator`，支持 OpenAI、Anthropic、Google 和 OpenAI-compatible REST 端点。每个提供方都可以覆盖 `model` 与 `baseUrl`；适配器会在 Base URL 后自动补齐对应的请求路径。旧的完整 `endpoint` 参数暂时保留兼容。

```ts
const generator = createBrowserByokGenerator({
  provider: 'custom',
  apiKey: sessionKey,
  model: 'local-model',
  baseUrl: 'https://example.com/v1'
})
```

生成器只接收调用方当前内存中的密钥。`generate()` 返回结构化结果；`stream()` 使用提供方的 SSE 接口逐步返回纯文本。浏览器直连适合学习者明确启用的 BYOK；课程作者的生产密钥应继续放在服务端或本地中继。
