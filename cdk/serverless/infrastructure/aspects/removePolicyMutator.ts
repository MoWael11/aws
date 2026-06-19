import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cdk from 'aws-cdk-lib';
import { IConstruct } from 'constructs';

// turns removal policies from retain to delete in dev env for db and s3
export class RemovePolicyAspect implements cdk.IAspect {
  private readonly env: string;

  constructor(env: string) {
    this.env = env;
  }

  public visit(node: IConstruct): void {
    if (this.env === 'dev') {
      if (node instanceof dynamodb.Table) {
        const table = node as dynamodb.Table;
        table.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
      } else if (node instanceof s3.Bucket) {
        const bucket = node as s3.Bucket;
        bucket.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
      }
    }
  }
}