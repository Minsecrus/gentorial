# `@gentorial/engine-vitepress`

Gentorial 的 VitePress 引擎桥接。它组合 VitePress 配置，安装 `concept`、`generate` Markdown 容器规则，把低干扰生成按钮挂载到对应标题，并将输出区域保留在作者原文之后；课程协议与 AI 请求不在此包中定义。

```ts
import { gentorialMarkdown } from '@gentorial/engine-vitepress'
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'My course',
  srcDir: '../content',
  markdown: {
    config: gentorialMarkdown
  }
})
```

`gentorialMarkdown` 是原生 VitePress `markdown.config` 回调，不引入第二套站点配置。旧的 `defineGentorialConfig` 暂时保留兼容，但新项目不再使用。

该回调同时把 `mermaid` fence 转成默认主题的惰性渲染组件；只有页面真正挂载图示时才动态加载 Mermaid。LaTeX 使用 VitePress 内置的 `markdown.math: true`，并由项目安装 `markdown-it-mathjax3`。
