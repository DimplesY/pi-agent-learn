/**
 * agent/03 · 状态管理（AgentState）
 *
 * Agent 把「系统提示 / 模型 / 思考等级 / 工具 / 消息」都收进 agent.state。
 * 大部分字段可读可写，运行时热切换；还有几个只读的运行期状态。
 */
import { Agent } from '@earendil-works/pi-agent-core';
import { DEFAULT_MODEL, getModels, pick } from '../shared/config';

const models = getModels();
const model = pick(models, 'openai', DEFAULT_MODEL);

const agent = new Agent({
  initialState: { systemPrompt: '你是一个助手。', model },
  streamFn: models.streamSimple.bind(models),
});

// 写：运行时切换配置
agent.state.thinkingLevel = 'medium';
agent.state.systemPrompt = '你现在改行当诗人，用押韵的方式回答。';

console.log('思考等级：', agent.state.thinkingLevel);
console.log('系统提示：', agent.state.systemPrompt);

// isStreaming 在运行中为 true，结束后回到 false
const run = agent.prompt('写一句关于代码的小诗。');
console.log('isStreaming（prompt 进行中）：', agent.state.isStreaming);
await run;
console.log('isStreaming（prompt 结束后）：', agent.state.isStreaming);

console.log('对话消息数：', agent.state.messages.length);
console.log('最近一次错误：', agent.state.errorMessage ?? '(无)');

// 运行状态（只读）：当前正在流式生成的半截消息、正在执行的工具调用 id
console.log('streamingMessage 有值吗：', agent.state.streamingMessage !== undefined);
console.log('pendingToolCalls（进行中工具）：', [...agent.state.pendingToolCalls]);

// 换模型：直接改 state.model 即可，下次轮次生效
agent.state.model = model;
console.log('已确认 model 仍是同一个：', agent.state.model.id === model.id);

// reset：清空转录、运行期状态和所有排队消息
agent.reset();
console.log('reset 后消息数：', agent.state.messages.length);

// 其它控制 API（这里只演示声明，不实际触发）：
//   agent.abort();            // 取消当前运行
//   await agent.waitForIdle(); // 等当前运行 + 所有 agent_end 监听器结束
