export type RemotePlatform = "devto" | "hashnode" | "medium" | "wordpress" | "ghost";

export interface PublisherSpec {
  id: RemotePlatform;
  name: string;
  /** 是否完全免费、纯 token 鉴权（无需 OAuth） */
  isFree: true;
  /** 用户取 token 的步骤指引（用于前端 UI） */
  tokenHelpUrl: string;
  /** 该平台是否需要额外的「账号 ID」(publicationId / userId) */
  needsAccountId?: boolean;
  accountIdLabel?: string;
  /** 一句话定位 */
  audience: string;
  /** 平台的标题字符上限（中英文按字符） */
  titleMax: number;
}

export interface PublishInput {
  token: string;
  accountId?: string;
  title: string;
  body: string;
  tags?: string[];
  canonicalUrl?: string;
  excerpt?: string;
  /** 是否发布（false=草稿） */
  publish?: boolean;
}

export interface PublishResult {
  ok: boolean;
  url?: string;
  remoteId?: string;
  error?: string;
}

export interface Driver {
  spec: PublisherSpec;
  /** 用 token 拉用户信息 / publication 列表，验证 token 有效性 */
  verify(token: string): Promise<{ ok: boolean; accountId?: string; accountName?: string; error?: string; accounts?: Array<{ id: string; name: string }> }>;
  publish(input: PublishInput): Promise<PublishResult>;
}
