# 课程配置参考

课程配置位于项目根目录的 `course.config.ts`，使用 `defineCourse()` 创建。

```ts
export default defineCourse({
  schemaVersion: '1',
  id: 'my-course',
  title: 'My course',
  lang: 'zh-CN',
  contentDir: 'content',
  generation: {
    mode: 'hybrid',
    defaultLocale: 'zh-CN'
  },
  rendering: {
    allowUnsafeHtml: false
  },
  accuracy: {
    policies: ['概念锚点的结论不可被反转']
  }
})
```

## 顶层字段

| 字段 | 作用 |
| --- | --- |
| `schemaVersion` | 当前课程协议版本，现为 `'1'` |
| `id` | 稳定课程 ID |
| `title` | 课程标题 |
| `lang` | 课程语言 |
| `contentDir` | 作者 Markdown 所在目录 |
| `generation` | 生成模式和默认语言 |
| `rendering` | AI 输出渲染策略 |
| `accuracy` | 提供给生成模型的准确性策略和标准 |

::: concept unsafe-html-config title="原始 HTML 权限"
`rendering.allowUnsafeHtml: true` 会让 AI 输出的原始 HTML 以当前站点的同源权限渲染。该字段默认应为 `false`，只有课程作者明确接受此权限边界时才开启。
:::

::: generate course-config-review kind=example concepts=unsafe-html-config
给出一个面向 C 语言教程的 course.config.ts 示例，保持字段集合与本页原文一致，并解释 accuracy.policies 应该写什么类型的约束。
:::
