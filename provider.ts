/**
 * provider.ts — 一个「自定义 provider」的真实例子
 *
 * pi-ai 把「服务商」抽象成 Provider：它拥有自己的模型目录、鉴权方式（API Key /
 * OAuth）和请求行为。内置 provider（openai / anthropic / google ...）已经帮你写好了，
 * 但只要你面对的是一个 OpenAI 兼容的接口（本地 Ollama、vLLM、公司代理、第三方网关），
 * 就需要用 createProvider() 自己造一个——本文件就是这么做的。
 *
 * 这里连接的是一个 OpenAI 兼容的代理地址，鉴权复用 OPENAI_API_KEY 环境变量。
 * 它复用了官方 openai 的模型目录（OPENAI_MODELS）和 openai-responses 协议实现，
 * 所以「看起来」就像在用 OpenAI，只是请求被打到了你指定的 baseUrl。
 */
import { createProvider, type Provider } from '@earendil-works/pi-ai';
import { anthropicMessagesApi, googleGenerativeAIApi, openAIResponsesApi } from '@earendil-works/pi-ai/compat';
import { ANTHROPIC_MODELS } from '@earendil-works/pi-ai/providers/anthropic.models';
import { GOOGLE_MODELS } from '@earendil-works/pi-ai/providers/google.models';
import { OPENAI_MODELS } from '@earendil-works/pi-ai/providers/openai.models';

export function AiCodeMirrorOpenAIProvider(): Provider<'openai-responses'> {
  return createProvider({
    id: 'openai',
    name: 'Custom Provider',
    // 代理 / 兼容端点的 baseUrl
    baseUrl: 'https://api.claudecode.net.cn/api/codex/backend-api/codex',
    auth: {
      apiKey: {
        name: 'OpenAI API Key',
        resolve: async () => ({
          auth: {
            apiKey: process.env.OPENAI_API_KEY!,
            baseUrl: 'https://api.claudecode.net.cn/api/codex/backend-api/codex',
          },
        }),
      },
    },
    // 复用官方 openai 的完整模型目录
    api: openAIResponsesApi(),
    models: Object.values(OPENAI_MODELS),
  });
}


export function AiCodeMirrorAnthropicProvider(): Provider<'anthropic-messages'> {
  return createProvider({
    id: 'anthropic',
    name: 'Custom Provider',
    baseUrl: 'https://api.claudecode.net.cn/api/claudecode',
    auth: {
      apiKey: {
        name: 'Anthropic API Key',
        resolve: async () => ({
          auth: {
            apiKey: process.env.ANTHROPIC_API_KEY!,
            baseUrl: 'https://api.claudecode.net.cn/api/claudecode',
          },
        }),
      },
    },
    // 复用官方 anthropic 的完整模型目录
    api: anthropicMessagesApi(),
    models: Object.values(ANTHROPIC_MODELS),
  });
}


export function AiCodeMirrorGoogleProvider(): Provider<"google-generative-ai"> {
  return createProvider({
    id: 'google',
    name: 'Custom Provider',
    baseUrl: 'https://api.claudecode.net.cn/api/gemini',
    auth: {
      apiKey: {
        name: 'Google API Key',
        resolve: async () => ({
          auth: {
            apiKey: process.env.GOOGLE_API_KEY!,
            baseUrl: 'https://api.claudecode.net.cn/api/gemini',
          },
        }),
      },
    },
    // 复用官方 google 的完整模型目录
		models: Object.values(GOOGLE_MODELS),
		api: googleGenerativeAIApi(),
  });
}
