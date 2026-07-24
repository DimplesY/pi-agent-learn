/**
 * agent/04 · 中途干预：steer 与 followUp
 *
 * Agent 支持在运行期间「插话」：
 *   - steer：在 agent 还在干活（或刚结束一轮）时插入新指令，让它改方向。
 *   - followUp：排队一个任务，等 agent 本来要停下时再接着做。
 *
 * 两者都是「往队列里塞一条 user 消息」，区别只在注入时机。
 */
import { Agent } from '@earendil-works/pi-agent-core';
import { DEFAULT_MODEL, getModels, pick } from '../shared/config';

const models = getModels();
const model = pick(models, 'openai', DEFAULT_MODEL);

const agent = new Agent({
  initialState: { systemPrompt: '你是一个助手，回答要简短。', model },
  streamFn: models.streamSimple.bind(models),
});

agent.subscribe((event) => {
  if (event.type === 'turn_end') console.log(`  [turn_end] 本轮工具结果数=${event.toolResults.length}`);
  if (event.type === 'message_update' && event.assistantMessageEvent.type === 'text_delta') {
    process.stdout.write(event.assistantMessageEvent.delta);
  }
});

// ---- 1) followUp：停下之后追加的任务 ----
// 在 prompt 之前排队，agent 正常答完一轮后，会再开一轮处理这个 followUp。
agent.followUp({ role: 'user', content: '再补一句同一话题的冷知识。', timestamp: Date.now() });
console.log('--- followUp 示例 ---');
await agent.prompt('用一句话介绍北京。');
console.log(`\nfollowUp 队列是否还有残留：${agent.hasQueuedMessages()}`);

// ---- 2) steer：运行中改主意 ----
// 发起 prompt 后立刻 steer（在 turn 结束前入队），agent 答完第一轮后会改去答新问题。
console.log('\n--- steer 示例 ---');
const run = agent.prompt('用一句话介绍上海。');
agent.steer({ role: 'user', content: '算了，改介绍广州吧。', timestamp: Date.now() });
await run;
console.log(`\nsteer 之后队列是否还有残留：${agent.hasQueuedMessages()}`);

// 清空队列的 API（需要时调用）：
//   agent.clearSteeringQueue(); agent.clearFollowUpQueue(); agent.clearAllQueues();
