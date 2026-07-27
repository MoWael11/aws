#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { PipelineStack } from '../lib/pipeline';
import { sharedConf } from '../config/shared';

const app = new cdk.App();

new PipelineStack(app, 'PipelineStack', {
  env: { account: sharedConf.deployAccount, region: sharedConf.deployRegion },
})

app.synth();