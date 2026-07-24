/**
 * agent/02 · 工具调用（Agent 的核心价值）
 *
 * 在 pi-ai 里，工具循环要你自己写（见 lessons/04-tools.ts）。
 * 在 pi-agent-core 里，你只需定义 AgentTool 并交给 Agent，它会自动：
 *   模型决定调工具 → 执行工具 → 把结果塞回 → 再问模型 → 直到不再调工具。
 *
 * AgentTool 相比 pi-ai 的 Tool 多了：
 *   - label：给 UI 看的名字
 *   - execute(toolCallId, params, signal, onUpdate)：真正干活的地方，返回内容 + 详情
 *   - executionMode：单工具覆盖并行/串行策略
 */
import { Agent, type AgentTool } from '@earendil-works/pi-agent-core';
import { Type } from '@earendil-works/pi-ai';
import { DEFAULT_MODEL, getModels, pick } from '../shared/config';

const models = getModels();
const model = pick(models, 'openai', DEFAULT_MODEL);

// 注意：AgentTool 是泛型 AgentTool<TParameters>。把 schema 抽成常量并用
// AgentTool<typeof schema> 标注，execute 里的 params 才会有精确类型（否则是 unknown）。
const timeSchema = Type.Object({
  timezone: Type.Optional(Type.String({ description: 'IANA 时区，例如 Asia/Shanghai' })),
});

const timeTool: AgentTool<typeof timeSchema> = {
  name: 'get_time',
  label: '获取时间',
  description: '获取当前时间，可指定时区',
  parameters: timeSchema,
  // execute 出错就直接 throw，Agent 会把它变成 isError 的工具结果回传给模型。
  // 别把错误当普通 content 返回。
  execute: async (_toolCallId, params) => {
    const text = new Date().toLocaleString('zh-CN', {
      timeZone: params.timezone ?? 'Asia/Shanghai',
      dateStyle: 'full',
      timeStyle: 'long',
    });
    return {
      content: [{ type: 'text', text }],
      details: { timezone: params.timezone ?? 'Asia/Shanghai' },
    };
  },
};

const agent = new Agent({
  initialState: {
    systemPrompt: '你需要时间时务必调用 get_time 工具，不要凭空编造。',
    model,
    tools: [timeTool],
  },
  streamFn: models.streamSimple.bind(models),
});

agent.subscribe((event) => {
  if (event.type === 'tool_execution_start') {
    console.log(`\n[工具开始] ${event.toolName}(${JSON.stringify(event.args)})`);
  } else if (event.type === 'tool_execution_end') {
    console.log(`[工具结束] isError=${event.isError}`);
  } else if (event.type === 'message_update' && event.assistantMessageEvent.type === 'text_delta') {
    process.stdout.write(event.assistantMessageEvent.delta);
  }
});

await agent.prompt('现在上海几点了？');
