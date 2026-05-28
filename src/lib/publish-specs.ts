/**
 * 客户端可安全 import 的平台规范数据。
 * 不含任何服务端依赖。
 */

export type PublishPlatform =
  | "zhihu"
  | "baijiahao"
  | "wechat"
  | "xiaohongshu"
  | "toutiao"
  | "shipinhao"
  | "bilibili";

export interface PlatformSpec {
  id: PublishPlatform;
  name: string;
  editorUrl: string;
  titleMaxLength: number;
  bodyTarget: [number, number];
  tone: string;
  format: string;
  hashtagStyle?: string;
  notes?: string;
}

export const PLATFORM_SPECS: Record<PublishPlatform, PlatformSpec> = {
  zhihu: {
    id: "zhihu",
    name: "知乎",
    editorUrl: "https://zhuanlan.zhihu.com/write",
    titleMaxLength: 50,
    bodyTarget: [1500, 3000],
    tone: "深度问答型，理性、结构化、有数据有案例",
    format: "Q&A 或长文。开头点题，中间用小标题分块，结尾给方法论或总结。",
    hashtagStyle: "无 hashtag，但可在结尾 #话题",
    notes: "知乎用户偏爱「答主深度」，避免推销口吻。",
  },
  baijiahao: {
    id: "baijiahao",
    name: "百家号",
    editorUrl: "https://baijiahao.baidu.com/builder/rc/edit",
    titleMaxLength: 30,
    bodyTarget: [800, 2000],
    tone: "信息流口吻、贴合百度搜索意图、关键词前置",
    format: "段落短、小标题密、可加配图",
    notes: "百度生态，强调与百度搜索关键词对齐。",
  },
  wechat: {
    id: "wechat",
    name: "公众号",
    editorUrl: "https://mp.weixin.qq.com/cgi-bin/loginpage",
    titleMaxLength: 64,
    bodyTarget: [1200, 2500],
    tone: "口语化深度、有人味、可讲故事",
    format: "首段悬念，中间观点 + 案例，结尾互动话题。",
    notes: "公众号读者粘性高，重视作者声音。",
  },
  xiaohongshu: {
    id: "xiaohongshu",
    name: "小红书",
    editorUrl: "https://creator.xiaohongshu.com/publish/publish",
    titleMaxLength: 20,
    bodyTarget: [400, 800],
    tone: "种草、亲切、emoji 友好",
    format: "短段落、emoji 表情符号、6–9 张配图。",
    hashtagStyle: "结尾必须 5–10 个 #话题",
    notes: "标题前用 emoji 抓眼球，正文要有真实使用体验感。",
  },
  toutiao: {
    id: "toutiao",
    name: "今日头条",
    editorUrl: "https://mp.toutiao.com/profile_v4/graphic/publish",
    titleMaxLength: 30,
    bodyTarget: [600, 1500],
    tone: "信息流偏好、标题党适度、地域化",
    format: "短段落、加粗关键句、配图。",
    notes: "标题需有冲突或好奇心钩子。",
  },
  shipinhao: {
    id: "shipinhao",
    name: "视频号 (脚本)",
    editorUrl: "https://channels.weixin.qq.com/platform/post/finderNewLifeCreate",
    titleMaxLength: 50,
    bodyTarget: [200, 600],
    tone: "口播脚本，60–180 秒",
    format: "钩子 5 秒 → 干货 60 秒 → 总结 + CTA 15 秒",
    notes: "脚本格式：[镜头][台词]，便于直接拍摄。",
  },
  bilibili: {
    id: "bilibili",
    name: "B 站专栏",
    editorUrl: "https://member.bilibili.com/platform/upload-manager/article",
    titleMaxLength: 40,
    bodyTarget: [1500, 4000],
    tone: "深度科普、专业、可有梗",
    format: "用一二级标题，可贴脑图截图。",
    notes: "B 站用户对硬核内容更宽容。",
  },
};
