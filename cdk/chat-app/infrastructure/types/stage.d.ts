import { StackProps } from "aws-cdk-lib";

export interface StageWithConfig extends StackProps {
  config: Config;
}