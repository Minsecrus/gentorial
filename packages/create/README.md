# `@gentorial/create`

Gentorial 项目脚手架，可通过以下任一方式启动：

```bash
# npm
npm create @gentorial@latest my-course

# pnpm
pnpm create @gentorial@latest my-course

# Yarn 2+
yarn dlx -p @gentorial/create@latest create-gentorial my-course

# Bun
bunx -p @gentorial/create@latest create-gentorial my-course
```

模板随 npm tarball 发布，不依赖远程仓库。目标目录非空时默认拒绝写入；创建后的项目无需模型密钥即可阅读静态内容，并通过确定性 mock 演示标题旁的按需讲解、无开发标记的正文直出、全局表达偏好，以及结果末尾带 placeholder 和发送按钮的追问输入。

交互模式会依次询问项目名、课程标题和语言，再确认是否安装依赖与初始化 Git。包管理器根据启动命令的 user agent 自动识别；无法识别时默认选择 pnpm。生成后的 README 和下一步提示会使用同一个包管理器。

CI 或自动化可以完整跳过交互：

```bash
create-gentorial my-course \
  --title "My course" \
  --lang en \
  --package-manager pnpm \
  --no-install \
  --no-git
```

## 参数

| 参数 | 作用 | 默认行为 |
| --- | --- | --- |
| `[project-name]` | 目标目录与 npm 项目名 | 交互模式询问；非交互模式必填 |
| `--title <title>` | 课程标题 | 使用项目名 |
| `--lang <locale>` | 课程语言 | `zh-CN` |
| `--package-manager <name>` | 指定 `pnpm`、`npm`、`yarn` 或 `bun` | 自动识别调用方；无法识别时使用 pnpm |
| `--install` | 创建后安装依赖 | 交互模式询问，默认是 |
| `--no-install` | 跳过依赖安装 | 覆盖交互默认值 |
| `--git` | 创建后执行 `git init` | 交互模式询问，默认是 |
| `--no-git` | 跳过 Git 初始化 | 覆盖交互默认值 |
| `-y`, `--yes` | 不提问并接受默认值 | 自动安装依赖并初始化 Git |
| `-h`, `--help` | 显示命令帮助 | — |

显式参数始终优先于自动识别和交互默认值。例如 `--yes --no-install --no-git` 会接受课程默认值，但仍跳过安装和 Git 初始化。
