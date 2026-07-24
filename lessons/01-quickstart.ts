/**
 * 第 1 课：第一次调用
 *
 * 目标：用最简单的方式让模型回答一个问题，并打印用量与费用。
 * 核心 API：models.complete(model, context) -> AssistantMessage
 *           （complete 不等流式，直接等模型把整段回答生成完。）
 */
import { type Context } from '@earendil-works/pi-ai';
import { DEFAULT_MODEL, getModels, pick } from '../shared/config';

const models = getModels();
const model = pick(models, 'openai', DEFAULT_MODEL);

// Context 就是「对话」：系统提示 + 消息列表（+ 可选的工具）。
// 它是纯数据（可 JSON 序列化），这也是 pi-ai 的一大特点——方便持久化和跨模型传递。
const context: Context = {
  systemPrompt: '你是一个简洁友好的助手，用中文回答。',
  messages: [
    { role: 'user', content: '用一句话解释什么是大语言模型？', timestamp: Date.now() },
  ],
};

const response = await models.complete(model, context);

// 回答由若干「内容块」组成：文本(text) / 思考(thinking) / 工具调用(toolCall)。
// 这里只取文本块打印。
for (const block of response.content) {
  if (block.type === 'text') console.log(block.text);
}

// 每次调用都会回报 token 用量和估算费用（跨厂商统一字段，不用自己换算）。
console.log('\n--- 用量与费用 ---');
console.log(`输入 tokens: ${response.usage.input}`);
console.log(`输出 tokens: ${response.usage.output}`);
console.log(`总费用:      $${response.usage.cost.total.toFixed(4)}`);
console.log(`停止原因:    ${response.stopReason}`);
