# 编写教程

Gentorial 的权威内容是普通 Markdown。`concept` 声明生成内容必须保留的结论，`generate` 声明可以按学习者偏好生成的讲解位置。

## 概念锚点

```md
::: concept switch-discrete title="离散分支"
`switch` 根据整数表达式的离散结果选择分支。
:::
```

::: concept concept-authority title="概念锚点的职责"
概念锚点保存作者确认的教学事实。生成内容可以改变表达和示例，但不得反转概念锚点的结论。
:::

## 生成位置

```md
::: generate switch-range kind=example concepts=switch-discrete
解释为什么 switch 不适合直接处理连续范围，并给出 if 链示例。
:::
```

`generate` 自动取得所在章节的标题、正文和来源位置。`concepts` 显式列出生成内容必须遵守的概念 ID。

支持的 `kind`：

- `explanation`
- `example`
- `comparison`
- `exercise`
- `feedback`

## 章节范围

生成位置绑定最近的 Markdown 标题。作者原文不会被替换；生成结果插入对应原文之后，并在同一区域内支持重新生成和继续追问。

::: generate authoring-review kind=example concepts=concept-authority
给出一个包含错误写法与修正写法的短例子，说明为什么稳定技术结论应该放在 concept 中，而个性化解释应该放在 generate 中。
:::

## AI 输出格式

生成管线使用标准 Markdown，支持段落、标题、列表、引用、链接、强调、行内代码、代码围栏和 `mermaid` 围栏。代码块由 Gentorial 的 VitePress 兼容渲染器处理。

`course.config.ts` 中的 `rendering.allowUnsafeHtml` 控制是否渲染 AI 输出中的原始 HTML。默认应保持关闭；开启后，原始 HTML 获得当前站点的同源权限。
