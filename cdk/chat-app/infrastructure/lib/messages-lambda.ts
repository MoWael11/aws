import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from "constructs";
import { Config } from '../types/config';

interface MessagesLambdaConstructProps {
  messageTable: dynamodb.Table
  config: Config
}

export class MessagesLambdaConstruct extends Construct {
  public readonly getMessagesLambda: NodejsFunction;
  constructor(scope: Construct, id: string, props: MessagesLambdaConstructProps) {
    super(scope, id);

    this.getMessagesLambda = new NodejsFunction(this, "GetMessages", {
      functionName: `${props.config.env}-${props.config.projectName}-get-messages`,
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: "index.handler",
      entry: "../backend/src/lambdas/messages/getMessages/index.ts", 
      logRetention: logs.RetentionDays.ONE_WEEK,
      environment: {
        MESSAGE_TABLE_NAME: props.messageTable.tableName,
      },
      projectRoot: "../backend",
      depsLockFilePath: "../backend/package-lock.json",
    })

    props.messageTable.grantReadData(this.getMessagesLambda);
  }
}