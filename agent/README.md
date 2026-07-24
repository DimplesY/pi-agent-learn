# pi-agent-core 教程

> `@earendil-works/pi-agent-core` 学习教程 —— 建立在 [pi-ai](https://github.com/earendil-works/pi) 之上的**有状态 Agent 运行时**。

pi-ai 给了你「调模型」的能力；pi-agent-core 在此基础上管起了**状态、工具循环、事件流、中途干预**：
你不再手写「流式 → 取结果 → 执行工具 → 再请求」那套样板，而是交给一个 `Agent` 类。

本教程是 [../README.md](../README.md)（pi-ai 部分）的姊妹篇。建议先学完 pi-ai 的 `lessons/01~04` 再来看这里。

---

## 它解决什么问题

| 你要的 | pi-ai 里 | pi-agent-core 里 |
|--------|----------|------------------|
| 调一次模型 | `models.complete/stream` | `Agent.prompt()` |
| 工具循环 | 自己写 | Agent 自动跑 |
| 多轮上下文 | 自己维护 `Context.messages` | `agent.state.messages` 自动累积 |
| 流式 UI | 自己订阅事件 | `agent.subscribe()` 统一事件流 |
| 跑到一半改指令 | 自己重新组织请求 | `agent.steer()` / `agent.followUp()` |

---

## 环境

与 pi-ai 部分共用同一套环境（Bun + `.env`）。`pi-agent-core` 依赖 `pi-ai@^0.82.0`，
本项目已统一到 0.82.0，无需额外安装。

```bash
bun install
bun run ../index.ts          # 看完整课程导航
bun run 01-agent-quickstart.ts
```

---

## 课程地图

| # | 文件 | 学什么 |
|---|------|--------|
| 01 | `01-agent-quickstart.ts` | `Agent` 类 + 订阅事件 + 发第一条 prompt |
| 02 | `02-agent-tools.ts` | `AgentTool` 定义与完整工具循环（Agent 自动执行工具） |
| 03 | `03-agent-state.ts` | 读写 `agent.state`（系统提示/模型/思考/工具/消息）、reset、isStreaming |
| 04 | `04-agent-steering.ts` | 中途干预：`steer`（改方向）与 `followUp`（停下后续做） |
| 05 | `05-agent-custom-messages.ts` | 声明合并扩展消息类型 + `convertToLlm` 过滤 UI 专用消息（**无密钥**） |
| 06 | `06-agent-lowlevel.ts` | 底层 `agentLoop` / `agentLoopContinue` |
| 07 | `07-agent-faux.ts` | **无密钥**：用 faux provider 当 `streamFn`，离线跑通 Agent 工具循环 |

---

## 核心心智模型

```
AgentMessage[] ──transformContext()──> AgentMessage[]
                                      │
                                      ▼
                              convertToLlm()  ──>  Message[]  ──>  LLM (streamFn)
```

- **`AgentMessage`** = LLM 消息（user/assistant/toolResult）+ 你自己的 UI 消息（声明合并扩展）。
- **`convertToLlm`**：每次调模型前，把「带 UI 消息的对话」转成「模型能懂的消息」，过滤掉 UI 专用类型。
- **事件流**：`agent_start → turn_start → message_start/update/end → (tool_execution_*) → turn_end → agent_end`。
  工具调用会触发新一轮（turn），直到模型不再调工具。

---

## 运行说明

- 需要 Key 的课（01/02/03/04/06）：和 pi-ai 一样，先在 `.env` 配好对应 Key，默认走 `builtinModels()`。
  只想用自己代理的，把 `shared/config.ts` 的 `getModels()` 改成返回 `getLocalModels()`。
- 无需 Key 的课（05/07）：直接 `bun run` 即可验证。

---

## 参考

- 包内完整 README：`node_modules/@earendil-works/pi-agent-core/README.md`
- 上层教程：[../README.md](../README.md)（pi-ai）
