import * as lambda from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import { Construct } from "constructs";

interface SocketHandlersConstrcutProps {
  connectionTable: dynamodb.Table
  messageTable: dynamodb.Table
  userPool: cognito.UserPool
  userPoolClient: cognito.UserPoolClient
}

export class SocketHandlersConstrcut extends Construct {
  public readonly connectHandler: NodejsFunction;
  public readonly defaultHandler: NodejsFunction;
  public readonly disconnectHandler: NodejsFunction;
  public readonly sendMessageHandler: NodejsFunction;
  public readonly authHandler: NodejsFunction;

  constructor(scope: Construct, id: string, props: SocketHandlersConstrcutProps) {
    super(scope, id);

    this.authHandler = new NodejsFunction(this, "AuthHandler", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      entry: "./backend/src/lambdas/handlers/authHandler/index.js",
      logRetention: logs.RetentionDays.ONE_WEEK,
      environment: {
        USER_POOL_ID: props.userPool.userPoolId,
        CLIENT_ID: props.userPoolClient.userPoolClientId,
      }
    })

    this.connectHandler = new NodejsFunction(this, "ConnectHandler", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      entry: "./backend/src/lambdas/handlers/connectHandler/index.js",
      logRetention: logs.RetentionDays.ONE_WEEK,
      environment: {
        CONNECTION_TABLE_NAME: props.connectionTable.tableName,
      }
    })

    props.connectionTable.grantWriteData(this.connectHandler);

    this.defaultHandler = new NodejsFunction(this, "DefaultHandler", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      entry: "./backend/src/lambdas/handlers/defaultHandler/index.js",
      logRetention: logs.RetentionDays.ONE_WEEK,
    })

    this.disconnectHandler = new NodejsFunction(this, "DisconnectHandler", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      entry: "./backend/src/lambdas/handlers/disconnectHandler/index.js",
      logRetention: logs.RetentionDays.ONE_WEEK,
      environment: {
        CONNECTION_TABLE_NAME: props.connectionTable.tableName,
      }
    })

    props.connectionTable.grantWriteData(this.disconnectHandler);

    this.sendMessageHandler = new NodejsFunction(this, "SendMessageHandler", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      entry: "./backend/src/lambdas/handlers/sendMessageHandler/index.js",
      logRetention: logs.RetentionDays.ONE_WEEK,
      environment: {
        CONNECTION_TABLE_NAME: props.connectionTable.tableName,
        MESSAGE_TABLE_NAME: props.messageTable.tableName,
      }
    })

    props.messageTable.grantReadWriteData(this.sendMessageHandler);
    props.connectionTable.grantReadData(this.sendMessageHandler);
  }
}