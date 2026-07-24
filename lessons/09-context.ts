/**
 * 第 9 课：上下文序列化（把对话存起来）
 *
 * 目标：Context 是纯 JSON 可序列化的数据。这意味着你可以：
 *   - 把整个对话存进数据库 / 文件 / localStorage；
 *   - 之后反序列化，用「完全不同的模型」继续聊（Context 是厂商中立的）；
 *   - 顺带把「用的是哪个模型」也用 JSON 存下来（Model 同样是纯数据，无函数）。
 */
import { type Context } from '@earendil-works/pi-ai';
import { DEFAULT_MODEL, getModels, pick } from '../shared/config';

const models = getModels();
const model = pick(models, 'openai', DEFAULT_MODEL);

const context: Context = {
  messages: [{ role: 'user', content: 'TypeScript 是什么？', timestamp: Date.now() }],
};

const reply = await models.complete(model, context);
context.messages.push(reply);
for (const b of reply.content) if (b.type === 'text') console.log('第一次回答：', b.text);

// ---- 序列化：存起来 ----
const saved = JSON.stringify(context, null, 2);
console.log('\n[已序列化] 长度', saved.length, '字符（可写入文件 / 数据库）');
// writeFileSync('chat.json', saved)

// ---- 反序列化：过一会儿再继续 ----
const restored: Context = JSON.parse(saved);
restored.messages.push({ role: 'user', content: '再多讲讲它的类型系统。', timestamp: Date.now() });

// 换一个模型继续，也能正常工作（这就是「厂商中立」的好处）
const otherModel = models.getModel('openai', DEFAULT_MODEL) ?? model;
const continuation = await models.complete(otherModel, restored);
console.log('\n继续回答：');
for (const b of continuation.content) if (b.type === 'text') console.log(b.text);
