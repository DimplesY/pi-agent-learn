# lessons/ — pi-ai 渐进式课程

> 11 节**可直接运行**的 [`@earendil-works/pi-ai`](https://github.com/earendil-works/pi) 示例课。
> 按顺序从 `01` 学到 `11`，每节都对应一个独立、可 `bun run` 的脚本。

想先了解整体项目背景、环境安装、provider 两种模式？回根目录看 [`../README.md`](../README.md)。

---

## 怎么跑

每节课都是一个独立的 TypeScript 文件，直接用 Bun 运行即可（无需编译、无需手动加载 `.env`）：

```bash
bun run lessons/01-quickstart.ts
```

把编号和文件名换掉就是另一节。课程之间**互不依赖、可单独运行**。

---

## 运行前准备

1. 安装依赖：`bun install`（在仓库根目录）。
2. 配置 Key：根目录 `cp .env.example .env`，填入你需要的 `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `OPENROUTER_API_KEY` 等。
3. 选 provider 模式：
   - **方式 A（默认）**：`shared/config.ts` 的 `getModels()` 返回 `builtinModels()`，注册全部官方 provider。
     多 provider 相关的第 8 课才能跑。
   - **方式 B（自定义代理）**：改成返回 `getLocalModels()`，走根目录 `provider.ts` 连你自己的兼容代理。
     注意：方式 B 只有一个 `openai` provider，依赖多 provider 的第 8 课会不可用。

> 💡 **不需要 Key 也能跑的课**：`02-models.ts`（查模型目录）、`10-faux.ts`（faux 离线跑通整套流程）。
> 想先验证环境、或没有 Key 又想看完整工具循环，从这俩入手。

---

## 课程清单

| # | 文件 | 运行命令 | 学什么 / 关键 API |
|---|------|----------|-------------------|
| 01 | `01-quickstart.ts` | `bun run lessons/01-quickstart.ts` | 第一次调用：`complete()` 一次性拿到回答，打印 token 用量与费用 |
| 02 | `02-models.ts` | `bun run lessons/02-models.ts` | 查询已注册 provider / 模型，读懂模型能力（视觉、推理、上下文窗口）— **无需 Key** |
| 03 | `03-streaming.ts` | `bun run lessons/03-streaming.ts` | `stream()` 事件流：文本 / 思考 / 工具事件如何区分与关联（`contentIndex`） |
| 04 | `04-tools.ts` | `bun run lessons/04-tools.ts` | **工具调用**：标准工具循环，让模型动手拿真实数据（Agent 核心） |
| 05 | `05-thinking.ts` | `bun run lessons/05-thinking.ts` | 开启「思考 / 推理」，统一接口 + 厂商专属选项 |
| 06 | `06-images.ts` | `bun run lessons/06-images.ts` | 图片作为输入（vision）+ 独立的图片生成 API（经 OpenRouter） |
| 07 | `07-errors.ts` | `bun run lessons/07-errors.ts` | 错误处理（`error` 事件）与中途取消（`AbortController`） |
| 08 | `08-handoff.ts` | `bun run lessons/08-handoff.ts` | 同一会话里切换不同厂商的模型（至少需两个真实 provider 的 Key） |
| 09 | `09-context.ts` | `bun run lessons/09-context.ts` | `Context` 是纯 JSON，可序列化 / 持久化 / 换模型续聊 |
| 10 | `10-faux.ts` | `bun run lessons/10-faux.ts` | **无需 Key**：用 faux provider 离线跑通整套流程（写单测神器） |
| 11 | `11-custom-provider.ts` | `bun run lessons/11-custom-provider.ts` | 用 `createProvider()` 接入任意 OpenAI 兼容端点（Ollama 示例） |

---

## 建议路径

- **只想快速看效果**：`01` → `03` → `04`
- **没有 Key / 想写测试**：`02` → `10`
- **想接自己的服务**：`11`（配合根目录 `provider.ts` 与方式 B）
- **学完再进阶**：`lessons/01~04` 之后，去 [`../agent/`](../agent/README.md) 学有状态 Agent 运行时 `pi-agent-core`

---

## 小抄

- `Models` 集合持有若干 provider，负责解析鉴权并转发请求；读取（`getProviders` / `getModels` / `getModel`）都是**同步**的。
- `Context` = `systemPrompt` + `messages[]` + 可选 `tools[]`，**纯数据、可 JSON 序列化**。
- `Tool` 用 [TypeBox](https://github.com/sinclairzx81/typebox) 写参数 schema（项目已重导出 `Type` / `Static` / `TSchema`）。
- 流式事件里文本 / 思考 / 工具三类块**不保证连续**，靠 `contentIndex` 正确关联。
