import * as lambda from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import { Construct } from "constructs";
import { Config } from '../types/config'

interface SocketHandlersConstrcutProps {
  connectionTable: dynamodb.Table
  messageTable: dynamodb.Table
  userPool: cognito.UserPool
  userPoolClient: cognito.UserPoolClient
  config: Config
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
      functionName: `${props.config.env}-${props.config.projectName}-auth-handler`,
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: "index.handler",
      entry: "../backend/src/lambdas/handlers/authHandler/index.ts",
      logRetention: logs.RetentionDays.ONE_WEEK,
      projectRoot: "../backend",
      depsLockFilePath: "../backend/package-lock.json",
      environment: {
        USER_POOL_ID: props.userPool.userPoolId,
        CLIENT_ID: props.userPoolClient.userPoolClientId,
      }
    })

    this.connectHandler = new NodejsFunction(this, "ConnectHandler", {
      functionName: `${props.config.env}-${props.config.projectName}-connect-handler`,
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: "index.handler",
      entry: "../backend/src/lambdas/handlers/connectHandler/index.ts",
      logRetention: logs.RetentionDays.ONE_WEEK,
      projectRoot: "../backend",
      depsLockFilePath: "../backend/package-lock.json",
      environment: {
        CONNECTION_TABLE_NAME: props.connectionTable.tableName,
      }
    })

    props.connectionTable.grantWriteData(this.connectHandler);

    this.defaultHandler = new NodejsFunction(this, "DefaultHandler", {
      functionName: `${props.config.env}-${props.config.projectName}-default-handler`,
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: "index.handler",
      entry: "../backend/src/lambdas/handlers/defaultHandler/index.ts",
      logRetention: logs.RetentionDays.ONE_WEEK,
      projectRoot: "../backend",
      depsLockFilePath: "../backend/package-lock.json",
    })

    this.disconnectHandler = new NodejsFunction(this, "DisconnectHandler", {
      functionName: `${props.config.env}-${props.config.projectName}-disconnect-handler`,
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: "index.handler",
      entry: "../backend/src/lambdas/handlers/disconnectHandler/index.ts",
      logRetention: logs.RetentionDays.ONE_WEEK,
      environment: {
        CONNECTION_TABLE_NAME: props.connectionTable.tableName,
      },
      projectRoot: "../backend",
      depsLockFilePath: "../backend/package-lock.json",
    })

    props.connectionTable.grantWriteData(this.disconnectHandler);

    this.sendMessageHandler = new NodejsFunction(this, "SendMessageHandler", {
      functionName: `${props.config.env}-${props.config.projectName}-send-message-handler`,
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: "index.handler",
      entry: "../backend/src/lambdas/handlers/sendMessageHandler/index.ts",
      logRetention: logs.RetentionDays.ONE_WEEK,
      environment: {
        CONNECTION_TABLE_NAME: props.connectionTable.tableName,
        MESSAGE_TABLE_NAME: props.messageTable.tableName,
      },
      projectRoot: "../backend",
      depsLockFilePath: "../backend/package-lock.json",
    })

    props.messageTable.grantReadWriteData(this.sendMessageHandler);
    props.connectionTable.grantReadData(this.sendMessageHandler);
  }
}