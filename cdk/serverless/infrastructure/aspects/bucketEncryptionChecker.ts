import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cdk from 'aws-cdk-lib';
import { IConstruct } from 'constructs';

export class BucketEncryptionChecker implements cdk.IAspect {
  public visit(node: IConstruct): void {
    if (node instanceof s3.Bucket) {
      const cfnBucket = node.node.defaultChild as s3.CfnBucket;

      if (!cfnBucket || !cfnBucket.bucketEncryption) {
        cdk.Annotations.of(node).addError(
          "S3 Bucket must have encryption enabled to protect data at rest."
        );
      }
    }
  }
}