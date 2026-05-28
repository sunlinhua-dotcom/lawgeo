import { devtoDriver } from "./devto";
import { hashnodeDriver } from "./hashnode";
import { mediumDriver } from "./medium";
import type { Driver, RemotePlatform } from "./types";

export const DRIVERS: Record<RemotePlatform, Driver | undefined> = {
  devto: devtoDriver,
  hashnode: hashnodeDriver,
  medium: mediumDriver,
  wordpress: undefined,
  ghost: undefined,
};

export const SUPPORTED_PLATFORMS: RemotePlatform[] = ["devto", "hashnode", "medium"];

export function getDriver(platform: RemotePlatform): Driver | null {
  return DRIVERS[platform] ?? null;
}

export type { Driver, RemotePlatform };
export type { PublishInput, PublishResult, PublisherSpec } from "./types";
