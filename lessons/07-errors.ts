/**
 * 第 7 课：错误处理与取消
 *
 * 目标：学会两件事——
 *   A) 请求出错时不抛异常，而是以 error 事件 + stopReason:'error' 的方式通知你；
 *   B) 用 AbortController 中途取消一个长请求（stopReason:'aborted'）。
 *
 * 好处：你的主流程不会被一个网络抖动打断，可以优雅地读 partial 内容或重试。
 */
import { type Context } from '@earendil-works/pi-ai';
import { DEFAULT_MODEL, getModels, pick } from '../shared/config';

const models = getModels();
const model = pick(models, 'openai', DEFAULT_MODEL);

const ctx: Context = {
  messages: [{ role: 'user', content: '写一首关于代码的短诗。', timestamp: Date.now() }],
};

// ---- A) 错误处理 ----
const s1 = models.stream(model, ctx);
for await (const event of s1) {
  if (event.type === 'text_delta') process.stdout.write(event.delta);
  if (event.type === 'error') console.error(`\n[错误] ${event.error.errorMessage}`);
}
const r1 = await s1.result();
if (r1.stopReason === 'error') {
  console.error('请求失败：', r1.errorMessage);
  // r1.content 里可能有出错前已经收到的部分内容
}

// ---- B) 中途取消 ----
const controller = new AbortController();
setTimeout(() => controller.abort(), 1500); // 1.5 秒后取消

const s2 = models.stream(model, ctx, { signal: controller.signal });
for await (const event of s2) {
  if (event.type === 'text_delta') process.stdout.write(event.delta);
  if (event.type === 'error') {
    console.log(`\n[${event.reason === 'aborted' ? '已取消' : '错误'}] ${event.error.errorMessage}`);
  }
}
const r2 = await s2.result();
if (r2.stopReason === 'aborted') {
  console.log('\n请求被取消，但已收到的部分内容仍可继续用：', r2.content.length, '个块');
}
