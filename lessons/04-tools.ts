/**
 * 第 4 课：工具调用（重点）
 *
 * 目标：让模型不只是「说话」，而是能「调用工具」去拿真实数据。这是 Agent 的核心。
 *
 * 标准工具循环（tool loop）：
 *   1) 定义工具（名字 / 描述 / 参数 schema，用 TypeBox）
 *   2) 把工具放进 Context，让模型知道「你能调用什么」
 *   3) 模型可能返回 toolCall（而不是普通文本）
 *   4) 你来执行这个工具，把结果作为 toolResult 塞回 Context
 *   5) 再调一次 complete/stream，模型基于工具结果给出最终回答
 */
import { Type, validateToolCall, type Context, type Tool } from '@earendil-works/pi-ai';
import { DEFAULT_MODEL, getModels, pick } from '../shared/config';

const models = getModels();
const model = pick(models, 'openai', DEFAULT_MODEL);

// ---- 1) 定义工具：用 TypeBox 写参数 schema，既给模型看，也用于校验 ----
const getTimeTool: Tool = {
  name: 'get_time',
  description: '获取当前时间。可指定时区。',
  parameters: Type.Object({
    timezone: Type.Optional(
      Type.String({ description: 'IANA 时区，例如 Asia/Shanghai、America/New_York' })
    ),
  }),
};

const context: Context = {
  systemPrompt: '你是一个助手。需要时间时务必调用 get_time 工具，不要凭空编造。',
  tools: [getTimeTool],
  messages: [
    { role: 'user', content: '现在上海几点了？', timestamp: Date.now() },
  ],
};

// ---- 2) 让模型跑，流式观察 ----
const stream = models.stream(model, context);
for await (const event of stream) {
  if (event.type === 'text_delta') process.stdout.write(event.delta);
  if (event.type === 'toolcall_start') console.log('\n[模型要调用工具了]');
}
console.log();

// ---- 3) 拿到完整结果，找出其中的工具调用 ----
const final = await stream.result();
context.messages.push(final); // 把模型的回复（含 toolCall）存回上下文

const toolCalls = final.content.filter((b) => b.type === 'toolCall');
for (const call of toolCalls) {
  console.log(`\n模型调用了：${call.name}(${JSON.stringify(call.arguments)})`);

  // ---- 4) 用 validateToolCall 校验参数；不合法就当错误回传给模型，让它重试 ----
  let resultText: string;
  try {
    const args = validateToolCall(context.tools ?? [], call);
    resultText = new Date().toLocaleString('zh-CN', {
      timeZone: args.timezone ?? 'Asia/Shanghai',
      dateStyle: 'full',
      timeStyle: 'long',
    });
  } catch (err) {
    resultText = `工具参数错误：${(err as Error).message}`;
  }

  // ---- 5) 把工具结果塞回 Context，作为 toolResult 消息 ----
  context.messages.push({
    role: 'toolResult',
    toolCallId: call.id,
    toolName: call.name,
    content: [{ type: 'text', text: resultText }],
    isError: false,
    timestamp: Date.now(),
  });
}

// ---- 如果模型调用了工具，再跑一次，让它基于结果总结回答 ----
if (toolCalls.length > 0) {
  const answer = await models.complete(model, context);
  console.log('\n最终回答：');
  for (const block of answer.content) {
    if (block.type === 'text') console.log(block.text);
  }
}
