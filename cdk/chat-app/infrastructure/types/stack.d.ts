import { StackProps } from "aws-cdk-lib";
import { Config } from "./config";

export interface StackPropsWithConfig extends StackProps {
  config: Config;
}
