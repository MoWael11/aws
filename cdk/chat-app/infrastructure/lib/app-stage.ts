import * as cdk from 'aws-cdk-lib';
import { StageWithConfig } from '../types/stage';
import { ChatAppStack } from '.';
import { Construct } from 'constructs';

export class AppStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props: StageWithConfig) {
    super(scope, id, props);

    const config = props.config;

    new ChatAppStack(this, 'ChatAppStack', {
      config,
    });
  }
}