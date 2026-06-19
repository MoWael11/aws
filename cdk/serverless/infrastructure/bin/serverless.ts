#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { InfraStack } from '../lib/infra';
import { AppsStack } from '../lib/apps';
import * as dotenv from 'dotenv';
import { Config } from '../types/config';
import { DLQChecker } from '../aspects/DLQChecker';
import { RemovePolicyAspect } from '../aspects/removePolicyMutator';
import { BucketEncryptionChecker } from '../aspects/bucketEncryptionChecker';

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

// ASPECTS
cdk.Aspects.of(apps).add(new DLQChecker());
cdk.Aspects.of(apps).add(new RemovePolicyAspect(stage)); // a mutator :) on env dev
cdk.Aspects.of(apps).add(new BucketEncryptionChecker()); 

app.synth();