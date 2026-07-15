# 纯前端 BYOK

纯前端模式不维护课程作者的生成服务。学习者在浏览器中主动提供自己的 Provider 配置。

::: concept byok-boundary title="BYOK 边界"
BYOK 请求从学习者浏览器直接发送到其选择的 Provider，不得读取或写入课程的服务端共享缓存。
:::

## 支持的提供方

- OpenAI
- Anthropic
- Google
- OpenAI-compatible 自定义端点

学习者可以配置 API Key、模型和 Base URL。自定义端点必须同时提供模型名称和 Base URL。

## 未配置时的行为

纯前端模板不会创建 `createMockGenerator`。没有 BYOK 时，作者原文照常显示；点击生成或发送追问会进入错误状态，并显示缺少生成配置的说明。

## 适用范围

纯前端模式适合个人工具、内部实验或课程作者不希望承担模型费用的站点。它不适合要求统一模型、统一参数、集中审计或跨用户复用生成结果的场景。

::: generate byok-decision kind=comparison concepts=byok-boundary
从费用承担、隐私、缓存命中、跨用户一致性和运维成本五方面，对比纯前端 BYOK 与统一服务端。
:::
