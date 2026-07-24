/**
 * 第 11 课：自定义 provider（接入任意 OpenAI 兼容端点）
 *
 * 目标：当内置 provider 不够用时（本地 Ollama、vLLM、公司代理、第三方网关），
 *      用 createProvider() 自己造一个。本文件用 Ollama 做例子。
 *
 * 真实世界里，你项目根目录的 provider.ts 就是这么做的——它把请求打到你指定的代理地址。
 * 关键三件套：
 *   - auth：怎么鉴权（免 key 用 {}，有 key 用 envApiKeyAuth 或自定义 resolve）
 *   - models：模型目录（静态写死，或用 fetchModels 动态拉取）
 *   - api：走哪套底层协议（openAICompletionsApi / openAIResponsesApi / anthropicMessagesApi ...）
 */
import {
  createModels,
  createProvider,
  type Context,
  type Model,
} from '@earendil-works/pi-ai';
import { openAICompletionsApi } from '@earendil-works/pi-ai/api/openai-completions.lazy';

// 1) 定义模型目录（这里是 Ollama 本地的一个模型）
const ollamaModel: Model<'openai-completions'> = {
  id: 'llama-3.1-8b',
  name: 'Llama 3.1 8B (Ollama)',
  api: 'openai-completions',
  provider: 'ollama',
  baseUrl: 'http://localhost:11434/v1',
  reasoning: false,
  input: ['text'],
  cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
  contextWindow: 128000,
  maxTokens: 32000,
};

// 2) 造 provider
const ollama = createProvider({
  id: 'ollama',
  name: 'Ollama',
  baseUrl: 'http://localhost:11434/v1',
  // 本地服务通常免 key。注意：pi 在真正发请求时要求解析出的 auth 至少含一个
  // 非空的 apiKey（或 provider.headers 里有 authorization），否则会报
  // "No API key for provider"。Ollama 会忽略这个占位值，所以填个占位即可。
  auth: { apiKey: { name: 'Ollama', resolve: async () => ({ auth: { apiKey: 'ollama-local' } }) } },
  models: [ollamaModel],
  api: openAICompletionsApi(),
});

const models = createModels();
models.setProvider(ollama);

const model = models.getModel('ollama', 'llama-3.1-8b');
if (!model) {
  console.error('[异常] 模型目录里找不到 ollama/llama-3.1-8b（理论上不该发生）。');
  process.exit(1);
}

const context: Context = {
  messages: [{ role: 'user', content: '你好，介绍一下你自己。', timestamp: Date.now() }],
};
const res = await models.complete(model, context);

// 如果本机没跑 Ollama，请求会失败（pi 不会抛异常，而是把错误放进 stopReason）。
if (res.stopReason === 'error') {
  console.error(`[跳过] 调用 Ollama 失败：${res.errorMessage ?? '未知错误'}`);
  console.error('这是预期内的——本机没运行 Ollama（http://localhost:11434）。');
  console.error('本节只为演示 createProvider 的写法，代码本身没有问题。');
  process.exit(0);
}

for (const b of res.content) if (b.type === 'text') console.log(b.text);
