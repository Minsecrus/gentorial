# 包与职责

| 包 | 职责 |
| --- | --- |
| `@gentorial/core` | 课程 schema、生成协议类型和校验 |
| `@gentorial/content` | Markdown 解析与课程目录编译 |
| `@gentorial/ai` | Prompt、Provider、BYOK、服务端客户端与生成 handler |
| `@gentorial/server` | 服务端统一凭据、生成服务和共享缓存 |
| `@gentorial/runtime-vue` | Vue 状态、偏好、生成生命周期和 Markdown 渲染 |
| `@gentorial/engine-vitepress` | VitePress Markdown 指令接入 |
| `@gentorial/theme-default` | 默认主题组件与样式 |
| `@gentorial/create` | 交互式项目脚手架 |

## 运行边界

`@gentorial/core`、`@gentorial/ai` 的浏览器入口和 Vue/主题包进入教程客户端。`@gentorial/server` 依赖 Node 文件与加密能力，只能用于服务端，不得进入 VitePress 客户端 bundle。

::: concept package-boundary title="服务端包边界"
客户端通过 `createGentorialServerGenerator` 调用 HTTP 端点；只有 Node 服务导入 `@gentorial/server` 并读取课程作者的环境变量 Key。
:::

::: generate package-path kind=explanation concepts=package-boundary
按作者 Markdown 被解析、浏览器触发生成、服务端调用 Provider、运行时渲染结果的顺序，解释各包如何协作。
:::
