import { Construct } from 'constructs';
import { Config } from '../../types/config';
import * as cdk from 'aws-cdk-lib'
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as eventsources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';

interface IngestionConstructProps {
  config: Config;
  vpc: ec2.IVpc;
  table: dynamodb.ITable;
}

export class IngestionConstruct extends Construct {
  public readonly lambdaFunction: lambda.Function;
  public readonly s3Bucket: s3.Bucket;
  public readonly sqsQueue: sqs.Queue;

  constructor(scope: Construct, id: string, props: IngestionConstructProps) {
    super(scope, id);

    const vpc = props.vpc;
    const table = props.table;

    this.s3Bucket = new s3.Bucket(this, "S3Bucket", {
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    const dlq = new sqs.Queue(this, 'DeadLetterQueue');

    this.sqsQueue = new sqs.Queue(this, "SQSQueue", {
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      deadLetterQueue: {
        maxReceiveCount: 10,
        queue: dlq,
      }
    });

    this.s3Bucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.SqsDestination(this.sqsQueue), {
      prefix: 'data/es1/',
      suffix: '.json',
    });


    this.lambdaFunction = new lambda.Function(this, "LambdaFunction", {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: "handler.lambda_handler",
      code: lambda.Code.fromAsset("./src/lambdas/sqs_to_dynamodb"),
      environment: {
        TABLE_NAME: table.tableName,
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
      vpc: vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
    })

    this.lambdaFunction.addEventSource(new eventsources.SqsEventSource(this.sqsQueue, {
      batchSize: 10,
      maxBatchingWindow: cdk.Duration.seconds(30),
    }));

    table.grantWriteData(this.lambdaFunction)
    this.sqsQueue.grantConsumeMessages(this.lambdaFunction)
  }
}