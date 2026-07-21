import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from "constructs";

interface MessagesLambdaConstructProps {
  messageTable: dynamodb.Table
}

export class MessagesLambdaConstruct extends Construct {
  public readonly getMessagesLambda: NodejsFunction;
  constructor(scope: Construct, id: string, props: MessagesLambdaConstructProps) {
    super(scope, id);

    this.getMessagesLambda = new NodejsFunction(this, "GetMessages", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      entry: "./backend/src/lambdas/messages/getMessages/index.js", 
      logRetention: logs.RetentionDays.ONE_WEEK,
      environment: {
        MESSAGE_TABLE_NAME: props.messageTable.tableName,
      }
    })

    props.messageTable.grantReadData(this.getMessagesLambda);
  }
}