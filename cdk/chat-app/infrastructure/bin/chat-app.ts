#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { ChatAppStack } from '../lib';

const app = new cdk.App();

new ChatAppStack(app, 'ChatAppStack', {
  env: { account: "919788038405", region: "us-east-1" },
  tags: {
    'project': "chat-app",
  },
});

app.synth();