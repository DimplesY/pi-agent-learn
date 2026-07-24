# pi-agent-learn

> 一个渐进式、可运行的 [`@earendil-works/pi-ai`](https://github.com/earendil-works/pi)（简称 **pi**）学习教程。

pi 是一个「统一的大模型 API」：一套代码，打通 OpenAI / Anthropic / Google / 以及几十个兼容端点，
自带**自动鉴权解析、token 与费用统计、工具调用、思考推理、跨厂商会话切换**。这个项目用 11 节
可直接 `bun run` 的示例课，带你把它学透。

---

## 环境要求

- **Bun** ≥ 1.3（本仓库按 Bun 配置；`bun` 会自动加载 `.env`，无需手动 `dotenv`）
- Node.js ≥ 22.19（pi-ai 的引擎要求，仅运行需要）
- 一个可用的 API Key（OpenAI / Anthropic / OpenRouter 等，或你自己的兼容代理）

## 快速开始

```bash
# 1. 安装依赖
bun install

# 2. 配置 API Key（复制模板后填入）
cp .env.example .env

# 3. 看课程导航
bun run index.ts

# 4. 跑第一颗糖
bun run lessons/01-quickstart.ts
```

所有课程都在 `lessons/` 下，按编号从 `01` 学到 `11` 即可。

> 💡 想用你自己的代理？见下方「两种 provider 模式」。

---

## 项目结构

```
pi-agent-learn/
├── README.md             # 本文件：项目说明与课程地图
├── index.ts              # 课程导航（bun run index.ts，Part1 / Part2 分块）
├── provider.ts           # 一个真实可用的「自定义 provider」示例（连接代理）
├── shared/
│   └── config.ts         # 统一入口：getModels() / getLocalModels() / pick()
├── lessons/              # 第一部分：pi-ai 渐进式课程（详见 lessons/README.md）
│   ├── README.md         # 本文件夹的课程清单与运行说明
│   ├── 01-quickstart.ts  # 第一次调用
│   ├── 02-models.ts      # 模型与提供商
│   ├── 03-streaming.ts   # 流式输出
│   ├── 04-tools.ts       # 工具调用（重点）
│   ├── 05-thinking.ts    # 思考 / 推理
│   ├── 06-images.ts      # 图片输入与生成
│   ├── 07-errors.ts      # 错误处理与取消
│   ├── 08-handoff.ts     # 跨厂商切换
│   ├── 09-context.ts     # 上下文序列化
│   ├── 10-faux.ts        # 无密钥测试
│   └── 11-custom-provider.ts # 自定义 provider
├── agent/                # 第二部分：pi-agent-core 有状态 Agent 教程（详见 agent/README.md）
│   ├── README.md         # Agent 教程首页与课程地图
│   ├── 01-agent-quickstart.ts
│   ├── 02-agent-tools.ts
│   ├── 03-agent-state.ts
│   ├── 04-agent-steering.ts
│   ├── 05-agent-custom-messages.ts
│   ├── 06-agent-lowlevel.ts
│   └── 07-agent-faux.ts
├── .env.example          # 环境变量模板（复制为 .env 并填 Key）
├── .gitignore            # 已忽略 node_modules / .env / 工具目录
├── tsconfig.json
├── package.json
├── bun.lock
└── CLAUDE.md
```

---

## 课程地图

| # | 文件 | 学什么 |
|---|------|--------|
| 01 | `lessons/01-quickstart.ts` | `complete()` 一次性拿到回答，并打印 token 用量与费用 |
| 02 | `lessons/02-models.ts` | 查询已注册 provider / 模型，读懂模型能力（视觉、推理、上下文窗口） |
| 03 | `lessons/03-streaming.ts` | `stream()` 的事件流：文本/思考/工具事件如何理解 |
| 04 | `lessons/04-tools.ts` | **工具调用**：标准工具循环，让模型动手拿真实数据（Agent 核心） |
| 05 | `lessons/05-thinking.ts` | 开启「思考/推理」，统一接口与厂商专属选项 |
| 06 | `lessons/06-images.ts` | 图片作为输入（vision）+ 独立的图片生成 API |
| 07 | `lessons/07-errors.ts` | 错误处理（error 事件）与中途取消（AbortController） |
| 08 | `lessons/08-handoff.ts` | 在同一会话里切换不同厂商的模型 |
| 09 | `lessons/09-context.ts` | Context 是纯 JSON，可序列化/持久化/换模型续聊 |
| 10 | `lessons/10-faux.ts` | **无需 Key**：用 faux provider 离线跑通整套流程（写单测神器） |
| 11 | `lessons/11-custom-provider.ts` | 用 `createProvider()` 接入任意 OpenAI 兼容端点（Ollama 示例） |

---

## 第二部分：pi-agent-core（有状态 Agent 运行时）

`pi-ai` 之上还有一层 [`@earendil-works/pi-agent-core`](https://github.com/earendil-works/pi)：它管起了**状态、自动工具循环、统一事件流、中途干预（steer/followUp）**。
如果说 `lessons/` 教你「怎么调模型」，那 `agent/` 教你「怎么让模型自己跑完一整个任务」。

- 教程首页与课程地图：**`agent/README.md`**
- 7 节课：`agent/01-agent-quickstart.ts` … `agent/07-agent-faux.ts`（导航见 `bun run index.ts`）

> 建议先学完 `lessons/01~04`，再去 `agent/`。

---

## 两种 provider 模式

pi 把「服务商」抽象成 **Provider**。本教程默认用方式 A（最贴近官方文档），但你也可以切到方式 B。

### 方式 A：内置 provider 集合（默认）

`shared/config.ts` 的 `getModels()` 返回 `builtinModels()`——一次性注册全部官方 provider。
你只需要在 `.env` 里填想用的 Key（如 `OPENAI_API_KEY`、`ANTHROPIC_API_KEY`），
第 8 课「跨厂商切换」等多 provider 章节才能跑。

### 方式 B：你自己的代理（provider.ts）

如果你身处无法直连官方 API 的网络，项目根目录的 `provider.ts` 已经写好一个自定义 provider，
把请求打到你的兼容代理（复用了官方 openai 的模型目录与协议）。

切换方式：打开 `shared/config.ts`，把 `getModels()` 改成返回 `getLocalModels()`：

```ts
export function getModels(): Models {
  return getLocalModels(); // 原来返回 builtinModels()
}
```

> ⚠️ 方式 B 只注册了 `openai` 这一个 provider，依赖「多个真实 provider」的第 8 课会不可用。

---

## 核心概念速览

- **`Models` 集合**：持有若干 provider，负责解析鉴权并把请求转发给拥有该模型的 provider。
  读取（`getProviders` / `getModels` / `getModel`）都是**同步**的。
- **`Context`**：一次对话。包含 `systemPrompt` + `messages[]` + 可选 `tools[]`。**纯数据、可 JSON 序列化**，
  这是 pi 能做「跨厂商续聊」「持久化」的基础。
- **`Tool`**：用 [TypeBox](https://github.com/sinclairzx81/typebox) 写参数 schema，
  既给模型看，也用于 `validateToolCall` 校验参数。
- **流式事件**：`stream()` 吐出 `start / text_* / thinking_* / toolcall_* / done / error`。
  关键规律——文本、思考、工具三类块的事件**不保证连续**，要用 `contentIndex` 正确关联。

---

## 常见问题

**Q：运行课程报「找不到模型 / 未配置」？**
A：先用 `bun run lessons/02-models.ts` 看注册了哪些 provider；确认 `.env` 里对应 Key 已填，
且 `getModels()` 用的是 `builtinModels()`（方式 A）。只用代理就改回 `getLocalModels()`。

**Q：第 8 课跨厂商切换跑不起来？**
A：它至少需要两个真实 provider 的 Key。只用本地代理（方式 B）时本课不可用。

**Q：图片生成那节没反应？**
A：图片生成目前只通过 OpenRouter，需要 `OPENROUTER_API_KEY`。

**Q：想换默认模型？**
A：改 `shared/config.ts` 顶部的 `DEFAULT_MODEL` 常量即可。

---

## 参考

- pi-ai 仓库：https://github.com/earendil-works/pi
- 包内完整 README（权威 API 文档）：`node_modules/@earendil-works/pi-ai/README.md`
- TypeBox：`@earendil-works/pi-ai` 已重新导出 `Type` / `Static` / `TSchema`
