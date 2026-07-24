/**
 * agent/01 · Agent 快速开始
 *
 * pi-agent-core 在 pi-ai 之上封装了一个「有状态、会自己跑工具循环」的 Agent。
 * 你不用再手写「流式 → 取结果 → 执行工具 → 再请求」那套样板，Agent 替你管了。
 *
 * 这一课：创建 Agent、订阅事件、发一条 prompt。
 */
import { Agent, type AgentEvent } from '@earendil-works/pi-agent-core';
import { DEFAULT_MODEL, getModels, pick } from '../shared/config';

const models = getModels();
const model = pick(models, 'openai', DEFAULT_MODEL);

// streamFn 告诉 Agent 用哪个「底层流式函数」去调模型。
// Models.streamSimple 正好满足 StreamFn 的形状，bind 一下即可。
const agent = new Agent({
  initialState: {
    systemPrompt: '你是一个简洁友好的助手，用中文回答。',
    model,
  },
  streamFn: models.streamSimple.bind(models),
});

// 订阅生命周期事件。Agent 把「流式文本 / 工具执行 / 轮次」都变成事件推给你，
// 你只管渲染 UI 或打印日志。
agent.subscribe((event: AgentEvent) => {
  if (event.type === 'message_update' && event.assistantMessageEvent.type === 'text_delta') {
    // 只把新增的文本小块写出去
    process.stdout.write(event.assistantMessageEvent.delta);
  } else if (event.type === 'message_end' && event.message.role === 'assistant') {
    console.log(); // 一轮回答结束，换行
  }
});

await agent.prompt('用一句话介绍 pi-agent-core 是什么。');

// prompt 结束后，整段对话已经留在 agent.state.messages 里
console.log(`\n[状态] 当前对话消息数：${agent.state.messages.length}`);
