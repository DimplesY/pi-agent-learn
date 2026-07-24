/**
 * agent/07 · 无密钥测试（用 faux provider 当 streamFn）
 *
 * Agent 只认一个 StreamFn，不关心背后是真模型还是假模型。
 * 所以我们把 pi-ai 的 fauxProvider 当 streamFn 喂给 Agent，就能在完全离线、
 * 不配任何 Key 的情况下，把「Agent 跑工具循环」这套流程跑通。
 *
 * 直接 bun run，无需 .env。
 */
import { Agent, type AgentTool } from '@earendil-works/pi-agent-core';
import {
  createModels,
  fauxAssistantMessage,
  fauxProvider,
  fauxText,
  fauxToolCall,
  Type,
} from '@earendil-works/pi-ai';

// 1) 造一个脚本化的假模型集合
const faux = fauxProvider();
const models = createModels();
models.setProvider(faux.provider);
const model = faux.getModel()!; // faux 自带一个默认模型

// 2) 定义一个普通 AgentTool（用 schema 常量 + AgentTool<typeof schema> 拿到精确 params 类型）
const echoSchema = Type.Object({ text: Type.String() });

const echoTool: AgentTool<typeof echoSchema> = {
  name: 'echo',
  label: '回声',
  description: '原样返回传入的文本',
  parameters: echoSchema,
  execute: async (_toolCallId, params) => ({
    content: [{ type: 'text', text: `echo: ${params.text}` }],
    details: {},
  }),
};

// 3) Agent 用 faux 的 streamSimple 当 streamFn —— 完全离线
const agent = new Agent({
  initialState: { systemPrompt: '你是助手。', model, tools: [echoTool] },
  streamFn: models.streamSimple.bind(models),
});

agent.subscribe((event) => {
  if (event.type === 'tool_execution_start') {
    console.log(`[工具] ${event.toolName}(${JSON.stringify(event.args)})`);
  } else if (event.type === 'message_update' && event.assistantMessageEvent.type === 'text_delta') {
    process.stdout.write(event.assistantMessageEvent.delta);
  }
});

// 4) 脚本化两轮回复（FIFO）：
//    第一轮让模型「决定调工具」，第二轮基于工具结果给最终文本
faux.setResponses([
  fauxAssistantMessage([fauxToolCall('echo', { text: '你好，agent' })], { stopReason: 'toolUse' }),
  fauxAssistantMessage([fauxText('我已经通过 echo 工具拿到了回复。')]),
]);

await agent.prompt('请调用 echo 说“你好，agent”。');

console.log(`\n[结果] 对话消息数：${agent.state.messages.length}`);
console.log('[结果] 消息角色：', agent.state.messages.map((m) => m.role).join(' -> '));
