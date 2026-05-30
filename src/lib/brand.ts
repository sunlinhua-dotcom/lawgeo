import "server-only";
import { cookies } from "next/headers";
import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "./db";

const BRAND_COOKIE = "lg:brand";

/** 取当前用户的全部品牌 */
export async function listBrands(userId: string) {
  return db
    .select()
    .from(schema.brands)
    .where(eq(schema.brands.userId, userId))
    .orderBy(desc(schema.brands.createdAt));
}

/** 取当前选中的品牌（cookie），无则取第一个 */
export async function getCurrentBrand(userId: string) {
  const all = await listBrands(userId);
  if (all.length === 0) return null;
  const cookieStore = await cookies();
  const sel = cookieStore.get(BRAND_COOKIE)?.value;
  return all.find((b) => b.id === sel) ?? all[0];
}

export async function getBrand(userId: string, brandId: string) {
  const rows = await db
    .select()
    .from(schema.brands)
    .where(and(eq(schema.brands.id, brandId), eq(schema.brands.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function getConversionProfile(brandId: string) {
  const rows = await db
    .select()
    .from(schema.brandConversionProfiles)
    .where(eq(schema.brandConversionProfiles.brandId, brandId))
    .limit(1);
  return rows[0] ?? null;
}

export { BRAND_COOKIE };
