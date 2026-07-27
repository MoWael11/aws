import { Config } from "../types/config";
import { devConfig } from "./dev";
import { prodConfig } from "./prod";
import { sharedConf } from "./shared";

export function getDevConfig(): Config {
  return {
    ...devConfig,
    ...sharedConf
  }
}

export function getProdConfig(): Config {
  return {
    ...prodConfig,
    ...sharedConf
  }
}