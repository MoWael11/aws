# Serverless CDK Project

This package defines a serverless infrastructure using AWS CDK and TypeScript.
It builds a shared VPC network, DynamoDB table, S3 + SQS storage integration, and a Lambda consumer.

## Architecture Overview

The project is organized into two main stacks:

- `InfraStack` (infrastructure)
  - Creates VPC networking and gateway endpoints.
- `AppsStack` (application)
  - Creates DynamoDB, storage, and compute resources.

The CDK entrypoint loads environment-specific configuration and deploys the infrastructure stack before the application stack.

## What it offers

- A reusable `VpcStack` for a VPC configured by environment settings.
- A `DynamoDBStack` with a table keyed by `FileKey` and `Timestamp`.
- A `StorageStack` with an encrypted, versioned S3 bucket and an SQS queue.
- A `ComputeStack` with a Python Lambda that consumes SQS messages and writes to DynamoDB.
- An S3 event notification that sends new JSON objects under `data/es1/` to SQS.
- A DynamoDB gateway endpoint in the VPC so table access can stay within the AWS network.

## Project Structure

```
cdk/serverless
├── infrastructure
│   ├── bin
│   │   └── serverless.ts        # CDK app entrypoint
│   ├── config
│   │   ├── dev.ts               # Development environment config
│   │   └── prod.ts              # Production environment config
│   ├── lib
│   │   ├── apps
│   │   │   ├── compute.ts       # Lambda compute stack
│   │   │   ├── dynamodb.ts      # DynamoDB stack
│   │   │   ├── storage.ts       # S3/SQS storage stack
   │   │   └── index.ts          # AppsStack orchestrator
│   │   ├── infra
│   │   │   ├── index.ts         # InfraStack orchestrator
│   │   │   └── vpc.ts           # VPC stack
│   ├── types
│   │   ├── config.d.ts          # Config interface
│   │   └── stack.d.ts           # Stack props types
├── package.json                 # Package dependencies and scripts
├── cdk.json                     # CDK app config and feature flags
└── tsconfig.json                # TypeScript configuration
```

## Configuration

The deployment environment is selected by the `ENV` environment variable.

- `ENV=dev` loads `infrastructure/config/dev.ts`
- `ENV=prod` loads `infrastructure/config/prod.ts`

Config includes:

- `projectName` — project tag and stack naming.
- `region` — target AWS region.
- `account` — AWS account ID.
- `env` — environment label.
- `infra.cidr` — VPC CIDR block.
- `infra.cidrMask` — subnet prefix length.

## Deployment

From `cdk/serverless`:

```bash
npm install
npm run build
ENV=dev npx cdk deploy
```

For production:

```bash
ENV=prod npx cdk deploy
```

## Notes

- `AppsStack` depends on `InfraStack`, so the VPC is created first.
- The Lambda is deployed into private isolated subnets and consumes messages from SQS.
- The S3 bucket is versioned and encrypted, and object creation under `data/es1/` delivers notifications to SQS.
- DynamoDB permissions are granted to the Lambda function for write access.

## Recommended improvements

- Add `cdk bootstrap` documentation and setup instructions.
- Add explicit unit or integration tests for the stacks.
- Expand the config model for multi-account or multi-region deployment.
