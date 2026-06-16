import { Config } from "../types/config";

export const config: Config = {
  projectName: "serverless",
  region: "us-east-1",
  account: "919788038405",
  env: "dev",
  infra: {
    cidr: '10.0.0.0/16',
    cidrMask: 24
  }
}