/**
 * 第 8 课：跨厂商切换（同一会话里换模型）
 *
 * 目标：pi-ai 的 Context 是「厂商中立」的。你可以让 Claude 先答，再让 GPT 接着答，
 *      模型之间会自动做兼容转换（比如把另一家的「思考块」转成 <thinking> 文本）。
 *
 * 前提：需要至少两个真实 provider 的 API Key（这里用 anthropic + openai + google）。
 *       如果只用本地代理（getLocalModels），本节课跑不起来——它只注册了一个 provider。
 */
import { type Context } from '@earendil-works/pi-ai';
import { getModels } from '../shared/config';

const models = getModels();

async function need(provider: string, id: string) {
  const m = models.getModel(provider, id);
  if (!m) {
    console.error(`[跳过] 没找到 ${provider}/${id}，请配置对应 API Key 后重试。`);
    process.exit(1);
  }
  return m;
}

const claude = await need('anthropic', 'claude-sonnet-5');
const gpt = await need('openai', 'gpt-5.5');
const gemini = await need('google', 'gemini-3-flash-preview');

const context: Context = { messages: [] };

// 1) Claude 先算（开启思考）
context.messages.push({ role: 'user', content: '25 * 18 等于多少？', timestamp: Date.now() });
context.messages.push(await models.completeSimple(gpt, context, { reasoning: 'medium' }));

// 2) 换 GPT 接着问（它会看到 Claude 的思考，被转成 <thinking> 文本）
context.messages.push({ role: 'user', content: '这个计算对吗？解释一下。', timestamp: Date.now() });
context.messages.push(await models.complete(gpt, context));

// 3) 再换 Gemini 问原始问题
context.messages.push({ role: 'user', content: '最开始的问题是什么？', timestamp: Date.now() });
const geminiRes = await models.complete(gemini, context);
for (const b of geminiRes.content) if (b.type === 'text') console.log(b.text);
