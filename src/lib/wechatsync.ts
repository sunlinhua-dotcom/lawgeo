/**
 * Wechatsync 浏览器扩展集成。
 *
 * 项目地址：https://github.com/wechatsync/wechatsync
 * SDK 仓库：https://github.com/wechatsync/article-syncjs
 *
 * 工作原理：
 * - 用户在浏览器登录公众号/知乎/头条/百家号/CSDN/简书/掘金/SegmentFault/小红书/WordPress 等 29+ 平台
 * - 安装 Wechatsync Chrome 扩展（https://chromewebstore.google.com/detail/.../onpoadmkhcefogpdneghihaegkilfcgg）
 * - 扩展会在所有页面注入 window.syncPost(article) 函数
 * - 我们的页面调用它 → 扩展拉起同步任务对话框 → 用户确认 → 自动用本地登录态发到选中的平台
 *
 * 这是个人/中小团队绕过「平台无开放 API + 需企业资质 OAuth」限制的唯一可行路径。
 */

export interface WechatsyncArticle {
  /** 标题（必填，64 字以内） */
  title: string;
  /** 摘要（120 字以内，公众号、知乎等会用这个字段） */
  desc: string;
  /** 正文 HTML 或 Markdown（必填） */
  content: string;
  /** 封面图 URL（公众号、百家号必须） */
  thumb?: string;
  /** 标签（部分平台支持） */
  tags?: string[];
  /** 原文链接（部分平台用作 canonical） */
  origin?: string;
}

/** 检测 Wechatsync 扩展是否已安装（在浏览器中执行） */
export function isWechatsyncInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return typeof (window as unknown as { syncPost?: unknown }).syncPost === "function";
}

/** 等待扩展注入 window.syncPost（最多 timeoutMs 毫秒） */
export function waitForWechatsync(timeoutMs = 1500): Promise<boolean> {
  return new Promise((resolve) => {
    if (isWechatsyncInstalled()) return resolve(true);
    const start = Date.now();
    const t = setInterval(() => {
      if (isWechatsyncInstalled()) {
        clearInterval(t);
        resolve(true);
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(t);
        resolve(false);
      }
    }, 100);
  });
}

/** 调用扩展：拉起同步对话框 */
export function syncToWechatsync(article: WechatsyncArticle): boolean {
  if (typeof window === "undefined") return false;
  const fn = (window as unknown as { syncPost?: (a: WechatsyncArticle) => void }).syncPost;
  if (typeof fn !== "function") return false;
  fn(article);
  return true;
}

/** Wechatsync 支持的平台清单（用于 UI 展示） */
export const WECHATSYNC_PLATFORMS = [
  { id: "wechat", name: "微信公众号", category: "blog" },
  { id: "zhihu", name: "知乎", category: "blog" },
  { id: "toutiao", name: "今日头条", category: "blog" },
  { id: "baijiahao", name: "百家号", category: "blog" },
  { id: "csdn", name: "CSDN", category: "tech" },
  { id: "jianshu", name: "简书", category: "blog" },
  { id: "juejin", name: "掘金", category: "tech" },
  { id: "segmentfault", name: "SegmentFault", category: "tech" },
  { id: "oschina", name: "OSCHINA 开源中国", category: "tech" },
  { id: "cnblogs", name: "博客园", category: "tech" },
  { id: "51cto", name: "51CTO 博客", category: "tech" },
  { id: "infoq", name: "InfoQ 写作平台", category: "tech" },
  { id: "weibo", name: "微博头条文章", category: "social" },
  { id: "xiaohongshu", name: "小红书", category: "social" },
  { id: "zsxq", name: "知识星球", category: "community" },
  { id: "ifanr", name: "爱范儿", category: "media" },
  { id: "36kr", name: "36 氪", category: "media" },
  { id: "huxiu", name: "虎嗅", category: "media" },
  { id: "tmtpost", name: "钛媒体", category: "media" },
  { id: "wordpress", name: "WordPress (含 metaWeblog)", category: "self-host" },
  { id: "typecho", name: "Typecho", category: "self-host" },
  { id: "hexo", name: "Hexo / Hugo (静态站)", category: "self-host" },
  { id: "ghost", name: "Ghost", category: "self-host" },
  { id: "dev-to", name: "Dev.to", category: "intl" },
  { id: "medium", name: "Medium", category: "intl" },
  { id: "hashnode", name: "Hashnode", category: "intl" },
  { id: "notion", name: "Notion", category: "intl" },
  { id: "feishu", name: "飞书文档", category: "self-host" },
  { id: "yuque", name: "语雀", category: "self-host" },
] as const;
