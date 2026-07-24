/**
 * agent/06 · 底层 API：agentLoop / agentLoopContinue
 *
 * 不想用 Agent 类？可以直接用 agentLoop 拿事件流。它更裸，但事件顺序和 Agent 一致，
 * 且不会等你的异步事件处理「落定」就开始下一阶段——需要「消息处理当屏障」时用 Agent 类。
 */
import { agentLoop, type AgentContext, type AgentLoopConfig } from '@earendil-works/pi-agent-core';
import { DEFAULT_MODEL, getModels, pick } from '../shared/config';

const models = getModels();
const model = pick(models, 'openai', DEFAULT_MODEL);

const context: AgentContext = { systemPrompt: '你是一个助手，回答要简短。', messages: [], tools: [] };

const config: AgentLoopConfig = {
  model,
  // 把 AgentMessage[] 转成模型懂的 Message[]（这里没有自定义消息，原样透传）
  convertToLlm: (msgs) => msgs.filter((m) => m.role === 'user' || m.role === 'assistant' || m.role === 'toolResult'),
  // 注意：streamFn 不在这里，而是作为 agentLoop() 的最后一个参数传入
};

const userMessage = { role: 'user', content: '用一句话介绍杭州。', timestamp: Date.now() } as const;

for await (const event of agentLoop([userMessage], context, config, undefined, models.streamSimple.bind(models))) {
  if (event.type === 'message_update' && event.assistantMessageEvent.type === 'text_delta') {
    process.stdout.write(event.assistantMessageEvent.delta);
  } else if (event.type === 'agent_end') {
    console.log(`\n[agent_end] 本次共产生 ${event.messages.length} 条消息`);
  }
}

// 继续已有上下文（最后一条消息必须是 user 或 toolResult）：
// for await (const event of agentLoopContinue(context, config, undefined, models.streamSimple.bind(models))) { ... }
