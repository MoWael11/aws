import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as sqs from 'aws-cdk-lib/aws-sqs';

export class StorageStack extends cdk.NestedStack {
  public readonly s3Bucket: s3.Bucket;
  public readonly sqsQueue: sqs.Queue;

  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    this.s3Bucket = new s3.Bucket(this, "S3Bucket", {
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    const dlq = new sqs.Queue(this, 'DeadLetterQueue');

    this.sqsQueue = new sqs.Queue(this, "SQSQueue", {
      encryption: sqs.QueueEncryption.SQS_MANAGED
      ,
      deadLetterQueue: {
        maxReceiveCount: 10,
        queue: dlq,
      }
    });

    this.s3Bucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.SqsDestination(this.sqsQueue,), {
      prefix: 'data/es1/',
      suffix: '.json',
    });
  }

}