/**
 * 第 3 课：流式输出
 *
 * 目标：理解 stream() 吐出的事件流。模型不是「一次性返回」，而是一块块吐出来的，
 * 流式能让你在模型还在生成时就先把字显示出来（聊天界面必备）。
 *
 * 事件类型（节选）：
 *   start / text_start / text_delta / text_end
 *   thinking_start / thinking_delta / thinking_end
 *   toolcall_start / toolcall_delta / toolcall_end
 *   done / error
 *
 * 关键规律：文本 / 思考 / 工具 三种内容块的事件**不保证连续**地出现，
 *          要用 contentIndex 把每段 delta 关联到正确的块上。
 */
import { type Context } from '@earendil-works/pi-ai';
import { DEFAULT_MODEL, getModels, pick } from '../shared/config';

const models = getModels();
const model = pick(models, 'openai', DEFAULT_MODEL);

const context: Context = {
  messages: [
    { role: 'user', content: '用三句话介绍 pi-ai 这个库。', timestamp: Date.now() },
  ],
};

const stream = models.stream(model, context);
for await (const event of stream) {
  switch (event.type) {
    case 'start':
      console.log(`[start] 模型：${event.partial.model}`);
      break;
    case 'text_start':
      process.stdout.write('\n[文本开始]\n');
      break;
    case 'text_delta':
      process.stdout.write(event.delta); // 每一小段文本增量
      break;
    case 'text_end':
      process.stdout.write('\n');
      break;
    case 'done':
      console.log(`[done] 停止原因：${event.reason}`);
      break;
    case 'error':
      console.error(`[error] ${event.error.errorMessage}`);
      break;
    // thinking_* / toolcall_* 暂不处理，后续课程会讲
  }
}

// 流式结束后用 result() 拿到完整的 AssistantMessage（含最终 usage）。
const final = await stream.result();
console.log(`\n[统计] 输入 ${final.usage.input} / 输出 ${final.usage.output} tokens`);
