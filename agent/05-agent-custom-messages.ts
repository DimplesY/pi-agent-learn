/**
 * agent/05 · 自定义消息类型（声明合并 + convertToLlm）
 *
 * AgentMessage 不只是 user/assistant/toolResult，还能通过「声明合并」扩展出
 * 你自己的 UI 专用消息（比如通知、产物卡片）。模型看不懂这些，所以要在
 * convertToLlm 里把它们过滤掉——这一步完全离线，不需要 API Key。
 */
import { Agent } from '@earendil-works/pi-agent-core';
import { type Message } from '@earendil-works/pi-ai';
import { DEFAULT_MODEL, getModels, pick } from '../shared/config';

// 通过声明合并，给 AgentMessage 增加一种 UI 专用消息类型。
declare module '@earendil-works/pi-agent-core' {
  interface CustomAgentMessages {
    notification: { role: 'notification'; text: string; timestamp: number };
  }
}

const models = getModels();
const model = pick(models, 'openai', DEFAULT_MODEL);

const agent = new Agent({
  initialState: { systemPrompt: '你是助手。', model },
  streamFn: models.streamSimple.bind(models),
  // 每次调模型前，把 AgentMessage[] 转成模型能懂的 Message[]。
  // 关键点：UI 专用消息（如 notification）要过滤掉。用 role 收窄，保证返回的是 Message[]。
  convertToLlm: (messages) =>
    messages.flatMap((m): Message[] => {
      if (m.role === 'user' || m.role === 'assistant' || m.role === 'toolResult') return [m];
      return []; // notification 等 UI-only 消息过滤掉
    }),
});

// 往对话里塞一条 notification（它不应进入模型上下文）
agent.state.messages.push({
  role: 'notification',
  text: '这是一条前端通知，不应进入模型上下文',
  timestamp: Date.now(),
});

// 直接调用 convertToLlm 看转换结果（不需要 API Key）
const llmMessages = await agent.convertToLlm(agent.state.messages);
console.log('对话里的消息角色：        ', agent.state.messages.map((m) => m.role));
console.log('传给模型的消息角色：      ', llmMessages.map((m) => m.role));
const notifInState = agent.state.messages.some((m) => m.role === 'notification');
const notifInLlm = llmMessages.some((m) => (m as { role: string }).role === 'notification');
console.log(`notification 过滤正确：state 中有=${notifInState}, 模型中无=${!notifInLlm}`);
