# 服务端配置参考

脚手架将所有常改的服务端生成字段集中在 `gentorial.server.config.ts`。

## 字段

| 字段 | 类型 | 作用 |
| --- | --- | --- |
| `provider` | `openai \| anthropic \| google \| custom` | 服务端统一 Provider |
| `model` | `string` | Provider 模型名称 |
| `baseUrl` | `string?` | 可选 Provider 基础地址；`custom` 必填 |
| `apiKeyEnv` | `string` | 保存 API Key 的服务端环境变量名 |
| `profileRevision` | `string` | Prompt、参数和输出协议修订身份 |
| `port` | `number` | 本地 Node 服务端口 |
| `cache.directory` | `string` | 单实例文件缓存目录 |
| `cache.ttlMs` | `number` | 缓存有效期，单位毫秒 |

::: concept server-config-sync title="环境变量同步"
修改 `apiKeyEnv` 后，必须在本地 `.env` 和生产部署平台中设置同名变量。配置文件只保存变量名，不保存真实 API Key。
:::

## 更换 Provider

OpenAI：

```ts
provider: 'openai',
model: 'gpt-5.1',
apiKeyEnv: 'OPENAI_API_KEY'
```

Anthropic：

```ts
provider: 'anthropic',
model: 'your-anthropic-model',
apiKeyEnv: 'ANTHROPIC_API_KEY'
```

OpenAI-compatible：

```ts
provider: 'custom',
model: 'your-model',
baseUrl: 'https://example.com/v1',
apiKeyEnv: 'CUSTOM_API_KEY'
```

同时修改 `.env` 中的变量名。不要把 Key 直接写进 `gentorial.server.config.ts`。

::: generate provider-config-check kind=exercise concepts=server-config-sync
给出三组配置诊断题，要求学习者判断 provider、baseUrl、apiKeyEnv 与 .env 是否一致，并在答案中仅使用本页列出的字段。
:::
