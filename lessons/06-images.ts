/**
 * 第 6 课：图片
 *
 * 两件事：
 *   1) 图片作为输入（vision）：把图片塞进 user 消息，让模型「看图说话」。
 *   2) 图片生成：用独立的 ImagesModels 集合（generateImages，一次性，不是聊天流）。
 *
 * 注意：图片生成目前只通过 OpenRouter 一个 provider 提供，需要 OPENROUTER_API_KEY。
 */
import { existsSync, readFileSync } from 'node:fs';
import { builtinImagesModels } from '@earendil-works/pi-ai/providers/all';
import { type Context } from '@earendil-works/pi-ai';
import { DEFAULT_MODEL, getModels, pick } from '../shared/config';

const models = getModels();
const model = pick(models, 'openai', DEFAULT_MODEL);

// ---- 1) 图片作为输入 ----
// 只有支持视觉的模型才会「看」图片；不支持的图片会被静默忽略。
if (model.input.includes('image')) {
  const imagePath = './demo.png'; // 放一张图到项目根目录即可
  if (existsSync(imagePath)) {
    const base64 = readFileSync(imagePath).toString('base64');
    const visionContext: Context = {
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: '这张图里有什么？请简短描述。' },
            { type: 'image', data: base64, mimeType: 'image/png' },
          ],
          timestamp: Date.now(),
        },
      ],
    };
    const visionRes = await models.complete(model, visionContext);
    for (const b of visionRes.content) if (b.type === 'text') console.log(b.text);
  } else {
    console.log(`[跳过] 没找到 ${imagePath}，放一张图进来就能试 vision。`);
  }
} else {
  console.log(`模型 ${model.id} 不支持视觉输入，跳过 vision 演示。`);
}

// ---- 2) 图片生成（独立集合 + 一次性 API）----
const imagesModels = builtinImagesModels();
const imgModel = imagesModels.getModel('openrouter', 'google/gemini-2.5-flash-image');
if (imgModel) {
  const result = await imagesModels.generateImages(imgModel, {
    input: [{ type: 'text', text: '生成一只在雪山前睡觉的橘猫，扁平插画风格。' }],
  });
  for (const block of result.output) {
    if (block.type === 'image') {
      console.log(`[生成图片] mimeType=${block.mimeType}, base64 长度=${block.data.length}`);
      // 真要保存：writeFileSync('out.png', Buffer.from(block.data, 'base64'))
    } else if (block.type === 'text') {
      console.log(`(附言) ${block.text}`);
    }
  }
} else {
  console.log('[跳过] 需要 OPENROUTER_API_KEY 才能生成图片。');
}
