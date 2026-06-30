import "server-only";
import { ask } from "./ai";
import { PLATFORM_SPECS, type PlatformSpec, type PublishPlatform } from "./publish-specs";

export { PLATFORM_SPECS };
export type { PlatformSpec, PublishPlatform };

const SYSTEM_TEMPLATE = (spec: PlatformSpec, originalTitle: string) => `你是一位资深的多平台内容运营。请把下面这段原始内容改写为「${spec.name}」平台的发布版本。

## 平台规范
- 标题长度：${spec.titleMaxLength} 字以内
- 正文目标字数：${spec.bodyTarget[0]}–${spec.bodyTarget[1]} 字
- 风格：${spec.tone}
- 结构：${spec.format}
${spec.hashtagStyle ? `- Hashtag：${spec.hashtagStyle}` : ""}
${spec.notes ? `- 注意：${spec.notes}` : ""}

## 合规约束（必须遵守）
- 禁止「最」「第一」「100%」「速效」等绝对化用语
- 美妆个护内容不得宣称医疗功效、不得使用「根治」「替代药品」等表述
- 不承诺保证效果，不暗示与监管部门关系
- 不贬损同行
- 测评 / 案例需注明个体差异（美妆为肤质差异，律所等场景为「以个案为准」）

## 输出要求
严格按下面格式输出 JSON：

\`\`\`json
{
  "title": "...",
  "excerpt": "120 字以内的摘要",
  "body": "完整正文内容（markdown）",
  "tags": ["标签1", "标签2", "..."]
}
\`\`\`

原始标题：${originalTitle}`;

interface AdaptResult {
  title: string;
  excerpt: string;
  body: string;
  tags: string[];
}

/**
 * 把同一份内容按平台规范改写。
 */
export async function adaptForPlatform(
  platform: PublishPlatform,
  original: { title: string; body: string },
): Promise<AdaptResult> {
  const spec = PLATFORM_SPECS[platform];
  const r = await ask({
    system: SYSTEM_TEMPLATE(spec, original.title),
    prompt: original.body,
    temperature: 0.5,
  });
  const m = r.text.match(/```json\s*([\s\S]+?)```/);
  const jsonStr = m?.[1] ?? r.text;
  try {
    const parsed = JSON.parse(jsonStr);
    return {
      title: String(parsed.title ?? original.title).slice(0, spec.titleMaxLength),
      excerpt: String(parsed.excerpt ?? "").slice(0, 200),
      body: String(parsed.body ?? r.text),
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 10).map(String) : [],
    };
  } catch {
    return {
      title: original.title.slice(0, spec.titleMaxLength),
      excerpt: r.text.slice(0, 200),
      body: r.text,
      tags: [],
    };
  }
}
