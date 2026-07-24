/**
 * index.ts — 课程导航
 *
 * 这个仓库是学习 pi（@earendil-works 的两个包）的渐进式教程：
 *   - lessons/   ：pi-ai（底层统一大模型 SDK）
 *   - agent/     ：pi-agent-core（有状态 Agent 运行时，建立在 pi-ai 之上）
 *
 * 运行方式（Bun）：
 *     bun run lessons/01-quickstart.ts
 *     bun run agent/01-agent-quickstart.ts
 *
 * 建议先学完 pi-ai 的 lessons/01~04，再去看 agent/。
 * 运行前请先配置 .env（参考 .env.example）。
 */
const lessons: { file: string; title: string }[] = [
  { file: 'lessons/01-quickstart.ts', title: '第一次调用：complete() 与用量/费用' },
  { file: 'lessons/02-models.ts', title: '模型与提供商：查询、筛选、能力探测' },
  { file: 'lessons/03-streaming.ts', title: '流式输出：吃透每一个事件' },
  { file: 'lessons/04-tools.ts', title: '工具调用（重点）：让模型动手干活' },
  { file: 'lessons/05-thinking.ts', title: '思考 / 推理：让模型「想清楚再答」' },
  { file: 'lessons/06-images.ts', title: '图片：作为输入的视觉，以及图片生成' },
  { file: 'lessons/07-errors.ts', title: '错误处理与取消：abort 与 error 事件' },
  { file: 'lessons/08-handoff.ts', title: '跨厂商切换：在同一会话里换模型' },
  { file: 'lessons/09-context.ts', title: '上下文序列化：把对话存起来' },
  { file: 'lessons/10-faux.ts', title: '无密钥测试：用 faux provider 跑通流程' },
  { file: 'lessons/11-custom-provider.ts', title: '自定义 provider：接入任意 OpenAI 兼容端点' },
];

const agentLessons: { file: string; title: string }[] = [
  { file: 'agent/01-agent-quickstart.ts', title: 'Agent 类 + 订阅事件 + 发第一条 prompt' },
  { file: 'agent/02-agent-tools.ts', title: 'AgentTool 定义与完整工具循环' },
  { file: 'agent/03-agent-state.ts', title: '读写 agent.state（系统提示/模型/工具/消息）' },
  { file: 'agent/04-agent-steering.ts', title: '中途干预：steer 与 followUp' },
  { file: 'agent/05-agent-custom-messages.ts', title: '自定义消息类型 + convertToLlm（无密钥）' },
  { file: 'agent/06-agent-lowlevel.ts', title: '底层 agentLoop / agentLoopContinue' },
  { file: 'agent/07-agent-faux.ts', title: '无密钥：用 faux provider 当 streamFn 跑通 Agent' },
];

function printSection(title: string, items: { file: string; title: string }[]) {
  console.log(`\n${title}`);
  for (const [i, lesson] of items.entries()) {
    const n = String(i + 1).padStart(2, '0');
    console.log(`  ${n}. ${lesson.file.padEnd(30)} ${lesson.title}`);
  }
}

console.log('pi-agent-learn · pi 学习教程（pi-ai + pi-agent-core）\n');
console.log('运行某一课： bun run <file>\n');
printSection('Part 1 · pi-ai（底层统一大模型 SDK）', lessons);
printSection('Part 2 · pi-agent-core（有状态 Agent 运行时）', agentLessons);
console.log('\n提示：先复制 .env.example 为 .env 并填入 API Key；各 agent 课详情见 agent/README.md。');
