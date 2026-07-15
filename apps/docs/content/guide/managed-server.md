# 统一服务端

带服务端模板把课程作者的 Provider、模型和 API Key 保留在 Node 服务中。浏览器只调用同源生成端点。

::: concept managed-secret title="服务端密钥边界"
课程作者的生产 API Key 只能通过服务端环境变量读取，不得写入 VitePress 配置、客户端环境变量或浏览器 bundle。
:::

## 首次配置

`.env`：

```dotenv
OPENAI_API_KEY=your-server-key
```

`gentorial.server.config.ts`：

```ts
const config = {
  provider: 'openai',
  model: 'gpt-5.1',
  apiKeyEnv: 'OPENAI_API_KEY',
  profileRevision: 'prompt-v1:lesson-v1',
  port: 8787,
  cache: {
    directory: '.gentorial/cache',
    ttlMs: 7 * 24 * 60 * 60 * 1000
  }
}
```

完整字段见[服务端配置参考](../reference/server-config.md)。

## 共享缓存

缓存键包含课程定义、章节原文、生成位置、概念锚点、学习者偏好、追问上下文和服务端生成配置身份。输入完全一致的用户可以复用同一结果。

响应头 `X-Gentorial-Cache` 可能为：

- `miss`：调用 Provider，并在完成后写入缓存。
- `hit`：返回已存在的完整生成结果。
- `bypass`：服务端没有启用缓存。

浏览器响应仍使用 `Cache-Control: no-store`；共享缓存由应用服务端管理，不是浏览器或 CDN 缓存。

::: concept cache-profile title="缓存版本身份"
`profileRevision` 必须在 Prompt、生成参数或输出协议变化时更新。Provider、模型与 Base URL 会和该修订值共同形成 generation profile，防止错误复用旧配置生成的结果。
:::

## BYOK 覆盖

运行时先判断学习者是否启用 BYOK。启用后直接创建浏览器生成器，不调用统一服务端，因此既不读取也不写入共享缓存。

::: generate managed-flow kind=explanation concepts=managed-secret,cache-profile
用一个简短的请求时序解释首次服务端生成、第二位相同偏好用户命中缓存，以及第三位 BYOK 用户绕过服务端的过程。
:::

## 访问控制

脚手架生成的服务默认只适合本地开发。公开部署前，应在 `createGentorialServer` 中增加 `authorize(request)`，并在应用边缘实施登录校验、限流、配额和监控，避免生成端点成为公开模型代理。
