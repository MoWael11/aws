#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { InfraStack } from '../lib/infra';
import { AppsStack } from '../lib/apps';
import * as dotenv from 'dotenv';
import { Config } from '../types/config';

dotenv.config();

const stage = process.env.ENV || 'dev';

const config: Config = stage === 'dev' ? require('../config/dev').config : require('../config/prod').config;

const app = new cdk.App();

const infra = new InfraStack(app, "InfraStack", {
  config,
  env: { account: config.account, region: config.region },
  tags: {
    'project': config.projectName,
    'env': config.env
  },
});

const apps = new AppsStack(app, "AppsStack", {
  config,
  env: { account: config.account, region: config.region },
  tags: {
    'project': config.projectName,
    'env': config.env
  },
  vpc: infra.vpc,
});

apps.addDependency(infra);