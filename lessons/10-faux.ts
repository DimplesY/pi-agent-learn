/**
 * 第 10 课：无密钥测试（faux provider）
 *
 * 目标：在不配置任何 API Key 的情况下，把整套「思考 + 工具调用 + 最终回答」流程跑通。
 * 做法：用 fauxProvider() 造一个「脚本化」的假 provider，喂给它预设的回复。
 *
 * 用途：写单测、做 demo、本地验证你的工具循环逻辑——完全离线、确定性、秒回。
 *       这课不需要 .env，直接 bun run 即可。
 */
import {
  createModels,
  fauxAssistantMessage,
  fauxProvider,
  fauxText,
  fauxThinking,
  fauxToolCall,
  Type,
  type Context,
  type Tool,
} from '@earendil-works/pi-ai';

const faux = fauxProvider();
const models = createModels();
models.setProvider(faux.provider);

const tool: Tool = {
  name: 'echo',
  description: '原样返回传入的文本',
  parameters: Type.Object({ text: Type.String() }),
};

const context: Context = {
  tools: [tool],
  messages: [{ role: 'user', content: '先想想，然后调用 echo 说 hello。', timestamp: Date.now() }],
};

// 预设第一轮回复：先思考，再调用工具
faux.setResponses([
  fauxAssistantMessage(
    [fauxThinking('我应该先调 echo 工具。'), fauxToolCall('echo', { text: 'hello' })],
    { stopReason: 'toolUse' }
  ),
]);

// 第一轮：拿到模型想要做的动作
const first = await models.complete(faux.getModel()!, context);
context.messages.push(first);

const toolCalls = first.content.filter((b) => b.type === 'toolCall');
console.log('模型想要调用的工具：', toolCalls.map((b) => (b as { name: string }).name));

// 执行工具，把结果塞回 Context
for (const block of toolCalls) {
  const call = block as { id: string; name: string };
  context.messages.push({
    role: 'toolResult',
    toolCallId: call.id,
    toolName: call.name,
    content: [{ type: 'text', text: 'hello (from tool)' }],
    isError: false,
    timestamp: Date.now(),
  });
}

// 预设第二轮回复：基于工具结果给出最终文本
faux.setResponses([
  fauxAssistantMessage([fauxText('工具返回了：hello (from tool)。搞定！')]),
]);

const final = await models.complete(faux.getModel()!, context);
console.log('最终回答：', final.content.find((b) => b.type === 'text')?.text);
