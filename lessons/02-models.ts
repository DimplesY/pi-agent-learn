/**
 * 第 2 课：模型与提供商
 *
 * 目标：学会「找到一个模型」并读懂它的元信息（上下文窗口、是否支持视觉 / 推理）。
 * 核心 API：models.getProviders() / getModels(provider?) / getModel(provider, id)
 *
 * 读取都是同步的——返回的是「最近一次已知的模型列表」，所以查询零延迟。
 */
import { hasApi } from '@earendil-works/pi-ai';
import { DEFAULT_MODEL, getModels, pick } from '../shared/config';

const models = getModels();

console.log('已注册的 provider：');
for (const p of models.getProviders()) {
  console.log(`  - ${p.id}  (${p.name})`);
}

console.log(`\nopenai 下的模型数量：${models.getModels('openai').length}`);

// 取出一个具体模型，看看 pi-ai 暴露了哪些能力信息。
const model = pick(models, 'openai', DEFAULT_MODEL);
console.log('\n模型元信息：');
console.log(`  id:            ${model.id}`);
console.log(`  name:          ${model.name}`);
console.log(`  api:           ${model.api}`);           // 底层协议，如 openai-responses
console.log(`  上下文窗口:     ${model.contextWindow} tokens`);
console.log(`  最大输出:       ${model.maxTokens} tokens`);
console.log(`  支持视觉:       ${model.input.includes('image')}`);
console.log(`  支持推理:       ${model.reasoning}`);

// 动态查到的模型类型较宽（Model<Api>）。如果要做「api 专属」的精细选项，
// 用 hasApi() 收窄类型——之后 stream/complete 的选项才会带完整类型提示。
if (hasApi(model, 'openai-responses')) {
  console.log('  -> 该模型可使用 openai-responses 的专属选项（如 reasoningEffort）。');
}
