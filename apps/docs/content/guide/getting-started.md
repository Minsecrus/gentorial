# 快速开始

## 环境要求

- Node.js `>=22.13.0`
- npm、pnpm、Yarn 2+ 或 Bun

## 创建项目

```bash
pnpm create @gentorial@latest my-course
```

脚手架会询问课程标题、语言、AI 原始 HTML 策略，以及是否创建带统一模型、服务端 Key 和共享缓存的生成服务。

::: concept scaffold-modes title="脚手架生成方式"
选择服务端会生成 Node API、文件缓存、VitePress 开发代理和集中配置；选择纯前端则只允许学习者配置 BYOK。两种方式均不包含 mock 生成器。
:::

## 带服务端项目

在 `.env` 中填写默认的服务端 Key：

```dotenv
OPENAI_API_KEY=your-server-key
```

按需修改 `gentorial.server.config.ts`，然后启动：

```bash
cd my-course
pnpm dev
```

`pnpm dev` 会同时启动 VitePress 与生成服务。VitePress 将 `/api/gentorial/*` 代理到本地 Node 服务。

## 纯前端项目

纯前端项目可以直接启动：

```bash
cd my-course
pnpm dev
```

作者原文立即可读。学习者需要在 Preferences 的 BYOK 页面填写真实 Provider、API Key、模型和 Base URL；未配置时生成操作会显示错误。

::: generate first-project-checklist kind=exercise concepts=scaffold-modes
生成一份不超过十项的首次运行检查清单，分别覆盖带服务端项目和纯前端项目，不要引入文档原文之外的配置字段。
:::

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `pnpm dev` | 启动完整开发环境 |
| `pnpm dev:web` | 只启动 VitePress |
| `pnpm dev:server` | 以监听模式启动生成服务 |
| `pnpm build` | 构建静态文档 |
| `pnpm server` | 启动 Node 生成服务 |
