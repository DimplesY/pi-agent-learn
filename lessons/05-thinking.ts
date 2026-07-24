/**
 * 第 5 课：思考 / 推理
 *
 * 目标：开启模型的「思考」能力——让它在回答前先把推理过程想清楚
 *       （OpenAI o 系列 / Claude 思考 / Gemini 思考等都支持）。
 *
 * 两种写法：
 *   A) 统一接口 completeSimple / streamSimple，用 reasoning 等级：
 *      'minimal' | 'low' | 'medium' | 'high' | 'xhigh' | 'max'
 *   B) 想要某个厂商的精细选项（如 OpenAI 的 reasoningEffort），
 *      用 hasApi() 收窄类型后传专属选项。
 */
import { hasApi, getSupportedThinkingLevels, type Context } from '@earendil-works/pi-ai';
import { DEFAULT_MODEL, getModels, pick } from '../shared/config';

const models = getModels();
const model = pick(models, 'openai', DEFAULT_MODEL);

if (!model.reasoning) {
  console.log(`模型 ${model.id} 不支持推理，本课的思考块会是空的。`);
}

const context: Context = {
  messages: [
    {
      role: 'user',
      content: '一步一步算：一本书 23 元，买 4 本再加 10 元运费，共多少钱？',
      timestamp: Date.now(),
    },
  ],
};

// ---- A) 统一接口：reasoning 等级 ----
const stream = models.streamSimple(model, context, { reasoning: 'medium' });
for await (const event of stream) {
  if (event.type === 'thinking_delta') process.stdout.write(event.delta);
  else if (event.type === 'text_delta') process.stdout.write(event.delta);
}
console.log();

// ---- B) 厂商专属选项（需要 hasApi 收窄类型）----
const final = hasApi(model, 'openai-responses')
  ? await models.complete(model, context, {
      reasoningEffort: 'medium',
      reasoningSummary: 'detailed', // 仅 OpenAI Responses API 支持
    })
  : await models.complete(model, context);

console.log('\n[最终内容块]');
for (const block of final.content) {
  if (block.type === 'thinking') console.log(`(思考) ${block.thinking}`);
  if (block.type === 'text') console.log(`(回答) ${block.text}`);
}

// 想知道某模型具体支持到哪一级推理
console.log(`\n该模型支持的推理等级：${getSupportedThinkingLevels(model).join(', ')}`);
