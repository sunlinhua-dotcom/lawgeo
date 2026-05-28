/**
 * 中国主要城市 (覆盖直辖市 + 省会 + 副省级 + 主要地级市)
 * 用于案由 × 地域矩阵生成
 */

export interface Region {
  name: string;
  slug: string;
  tier: 1 | 2 | 3;
  province: string;
}

export const REGIONS: Region[] = [
  // 一线
  { name: "北京", slug: "beijing", tier: 1, province: "北京" },
  { name: "上海", slug: "shanghai", tier: 1, province: "上海" },
  { name: "广州", slug: "guangzhou", tier: 1, province: "广东" },
  { name: "深圳", slug: "shenzhen", tier: 1, province: "广东" },

  // 新一线 / 副省级
  { name: "成都", slug: "chengdu", tier: 2, province: "四川" },
  { name: "杭州", slug: "hangzhou", tier: 2, province: "浙江" },
  { name: "重庆", slug: "chongqing", tier: 2, province: "重庆" },
  { name: "武汉", slug: "wuhan", tier: 2, province: "湖北" },
  { name: "西安", slug: "xian", tier: 2, province: "陕西" },
  { name: "苏州", slug: "suzhou", tier: 2, province: "江苏" },
  { name: "南京", slug: "nanjing", tier: 2, province: "江苏" },
  { name: "天津", slug: "tianjin", tier: 2, province: "天津" },
  { name: "郑州", slug: "zhengzhou", tier: 2, province: "河南" },
  { name: "长沙", slug: "changsha", tier: 2, province: "湖南" },
  { name: "东莞", slug: "dongguan", tier: 2, province: "广东" },
  { name: "佛山", slug: "foshan", tier: 2, province: "广东" },
  { name: "宁波", slug: "ningbo", tier: 2, province: "浙江" },
  { name: "青岛", slug: "qingdao", tier: 2, province: "山东" },
  { name: "沈阳", slug: "shenyang", tier: 2, province: "辽宁" },
  { name: "合肥", slug: "hefei", tier: 2, province: "安徽" },

  // 二线
  { name: "无锡", slug: "wuxi", tier: 3, province: "江苏" },
  { name: "济南", slug: "jinan", tier: 3, province: "山东" },
  { name: "厦门", slug: "xiamen", tier: 3, province: "福建" },
  { name: "福州", slug: "fuzhou", tier: 3, province: "福建" },
  { name: "大连", slug: "dalian", tier: 3, province: "辽宁" },
  { name: "哈尔滨", slug: "harbin", tier: 3, province: "黑龙江" },
  { name: "长春", slug: "changchun", tier: 3, province: "吉林" },
  { name: "昆明", slug: "kunming", tier: 3, province: "云南" },
  { name: "南昌", slug: "nanchang", tier: 3, province: "江西" },
  { name: "贵阳", slug: "guiyang", tier: 3, province: "贵州" },
  { name: "南宁", slug: "nanning", tier: 3, province: "广西" },
  { name: "兰州", slug: "lanzhou", tier: 3, province: "甘肃" },
  { name: "海口", slug: "haikou", tier: 3, province: "海南" },
  { name: "三亚", slug: "sanya", tier: 3, province: "海南" },
  { name: "石家庄", slug: "shijiazhuang", tier: 3, province: "河北" },
  { name: "太原", slug: "taiyuan", tier: 3, province: "山西" },
  { name: "呼和浩特", slug: "huhehaote", tier: 3, province: "内蒙古" },
  { name: "乌鲁木齐", slug: "wulumuqi", tier: 3, province: "新疆" },
  { name: "银川", slug: "yinchuan", tier: 3, province: "宁夏" },
  { name: "西宁", slug: "xining", tier: 3, province: "青海" },
  { name: "拉萨", slug: "lhasa", tier: 3, province: "西藏" },
  { name: "温州", slug: "wenzhou", tier: 3, province: "浙江" },
  { name: "嘉兴", slug: "jiaxing", tier: 3, province: "浙江" },
  { name: "绍兴", slug: "shaoxing", tier: 3, province: "浙江" },
  { name: "金华", slug: "jinhua", tier: 3, province: "浙江" },
  { name: "常州", slug: "changzhou", tier: 3, province: "江苏" },
  { name: "南通", slug: "nantong", tier: 3, province: "江苏" },
  { name: "徐州", slug: "xuzhou", tier: 3, province: "江苏" },
  { name: "扬州", slug: "yangzhou", tier: 3, province: "江苏" },
  { name: "珠海", slug: "zhuhai", tier: 3, province: "广东" },
  { name: "中山", slug: "zhongshan", tier: 3, province: "广东" },
  { name: "惠州", slug: "huizhou", tier: 3, province: "广东" },
  { name: "汕头", slug: "shantou", tier: 3, province: "广东" },
  { name: "湛江", slug: "zhanjiang", tier: 3, province: "广东" },
  { name: "潍坊", slug: "weifang", tier: 3, province: "山东" },
  { name: "烟台", slug: "yantai", tier: 3, province: "山东" },
  { name: "济宁", slug: "jining", tier: 3, province: "山东" },
  { name: "临沂", slug: "linyi", tier: 3, province: "山东" },
  { name: "唐山", slug: "tangshan", tier: 3, province: "河北" },
  { name: "保定", slug: "baoding", tier: 3, province: "河北" },
  { name: "邯郸", slug: "handan", tier: 3, province: "河北" },
  { name: "洛阳", slug: "luoyang", tier: 3, province: "河南" },
  { name: "南阳", slug: "nanyang", tier: 3, province: "河南" },
  { name: "襄阳", slug: "xiangyang", tier: 3, province: "湖北" },
  { name: "宜昌", slug: "yichang", tier: 3, province: "湖北" },
  { name: "株洲", slug: "zhuzhou", tier: 3, province: "湖南" },
  { name: "湘潭", slug: "xiangtan", tier: 3, province: "湖南" },
  { name: "桂林", slug: "guilin", tier: 3, province: "广西" },
  { name: "柳州", slug: "liuzhou", tier: 3, province: "广西" },
  { name: "泉州", slug: "quanzhou", tier: 3, province: "福建" },
  { name: "莆田", slug: "putian", tier: 3, province: "福建" },
  { name: "九江", slug: "jiujiang", tier: 3, province: "江西" },
  { name: "赣州", slug: "ganzhou", tier: 3, province: "江西" },
  { name: "芜湖", slug: "wuhu", tier: 3, province: "安徽" },
  { name: "蚌埠", slug: "bengbu", tier: 3, province: "安徽" },
  { name: "包头", slug: "baotou", tier: 3, province: "内蒙古" },
];

/** 简单的 AI 提及度 mock（按 tier 加随机扰动） */
export function aiVisibility(region: Region, base = 50) {
  const tierBoost = { 1: 30, 2: 18, 3: 5 }[region.tier];
  const seed = region.slug.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const jitter = (seed % 17) - 8;
  return Math.max(5, Math.min(95, base + tierBoost + jitter));
}
