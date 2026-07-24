/**
 * shared/config.ts — 教程的统一「模型集合」入口
 *
 * 这个文件是整套课程的公共底座。所有的 lessons/* 都通过这里的函数拿到一个
 * `Models` 集合，再对它调用 stream / complete。这样课程的代码可以专注于「学什么」，
 * 而不是「怎么连上服务商」。
 *
 * 你有两种拿 Models 的方式，看下面 getModels() 与 getLocalModels() 的注释。
 */
import { createModels, type Models } from '@earendil-works/pi-ai';
import { builtinModels } from '@earendil-works/pi-ai/providers/all';
import { AiCodeMirrorAnthropicProvider, AiCodeMirrorGoogleProvider, AiCodeMirrorOpenAIProvider } from '../provider';

/**
 * 你最常用的默认模型 id。
 * - 用内置 provider（getModels）时：填官方 id，如 'gpt-4o-mini'、'claude-sonnet-4-5'。
 * - 用本地代理（getLocalModels）时：填你的代理支持的 id（原项目用的是 'gpt-5.6-sol'）。
 * 改这一个常量，就能全局切换模型。
 */
export const DEFAULT_MODEL = 'gpt-5.5';

/**
 * 方式 A（推荐，官方文档的标准用法）：注册全部内置 provider。
 *
 * 优点：
 *   - 无需自己写 provider，直接按官方文档使用；
 *   - 课程里「跨厂商切换」「图片生成」等多 provider 章节都能跑。
 * 代价：
 *   - 需要在 .env 里配置你想用到的服务商的 API Key
 *     （例如 OPENAI_API_KEY、ANTHROPIC_API_KEY、OPENROUTER_API_KEY 等）。
 *
 * 注意返回类型是 Models（只读集合），课程里只会调用 stream/complete/getModel，足够了。
 */
export function getModels(): Models {
  return getLocalModels();
}

/**
 * 方式 B（备选）：只注册你自己的代理 provider（见根目录 provider.tsx）。
 *
 * 如果你身处无法直连官方 API 的网络、手上只有一个代理可用，就把 getModels() 的
 * return 改成 `return getLocalModels();`，整套课程就会走你的代理。
 *
 * 代价：只注册了 openai 这一个 provider，依赖「多 provider」的章节
 *       （如 08 跨厂商切换）会不可用——它们需要至少两个真实 provider。
 */
export function getLocalModels(): Models {
  const models = createModels();
  models.setProvider(AiCodeMirrorOpenAIProvider());
  models.setProvider(AiCodeMirrorAnthropicProvider());
  models.setProvider(AiCodeMirrorGoogleProvider());
  return models;
}

/**
 * 从集合里取模型；找不到就打印清晰的错误并退出。
 * 课程里统一用它，避免到处写 `if (!model) { ... }` 样板代码。
 */
export function pick(models: Models, provider: string, id: string) {
  const model = models.getModel(provider, id);
  if (!model) {
    console.error(
      `[config] 在 provider "${provider}" 中找不到模型 "${id}"。\n` +
      `  当前 getModels() 默认使用内置 provider 集合，请确认：\n` +
      `    1) .env 里配置了对应服务商的 API Key；\n` +
      `    2) 模型 id 拼写正确。\n` +
      `  若你只用本地代理，把 shared/config.ts 里 getModels() 改为返回 getLocalModels()。`
    );
    process.exit(1);
  }
  return model;
}
