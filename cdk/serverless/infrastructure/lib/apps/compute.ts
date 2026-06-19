import * as cdk from 'aws-cdk-lib'
import { NestedStackPropsWithConfig } from '../../types/stack';
import { Construct } from 'constructs';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as eventsources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

interface ComputeStackProps extends NestedStackPropsWithConfig {
  sqsQueue: Queue;
  vpc: ec2.IVpc;
  table: dynamodb.ITable;
}

export class ComputeStack extends cdk.NestedStack {
  public readonly lambdaFunction: lambda.Function;

  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props)

    const vpc = props.vpc;
    const sqsQueue = props.sqsQueue;
    const table = props.table;

    this.lambdaFunction = new lambda.Function(this, "LambdaFunction", {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: "handler.lambda_handler",
      code: lambda.Code.fromAsset("./src/lambdas/sqs_to_dynamodb"),
      environment: {
        TABLE_NAME: table.tableName,
      },
      vpc: vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
    })

    this.lambdaFunction.addEventSource( new eventsources.SqsEventSource(sqsQueue, {
      batchSize: 10,
      maxBatchingWindow: cdk.Duration.seconds(30),
    }) );

    table.grantWriteData(this.lambdaFunction)
    sqsQueue.grantConsumeMessages(this.lambdaFunction)
  }
}