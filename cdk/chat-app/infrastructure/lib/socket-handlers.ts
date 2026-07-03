import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from "constructs";

interface SocketHandlersProps {
  table: dynamodb.Table
}

export class SocketHandlers extends Construct {
  public readonly connectHandler: lambda.Function;
  public readonly defaultHandler: lambda.Function;
  public readonly disconnectHandler: lambda.Function;
  public readonly sendMessageHandler: lambda.Function;
  
  constructor(scope: Construct, id: string, socketHandlersProps: SocketHandlersProps)  {
    super(scope, id);

    this.connectHandler = new lambda.Function(this, "ConnectHandler", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("./backend/src/lambdas/connectHandler"),
      logRetention: logs.RetentionDays.ONE_WEEK,
      environment: {
        TABLE_NAME: socketHandlersProps.table.tableName,
      }
    })
  
    socketHandlersProps.table.grantWriteData(this.connectHandler);

    this.defaultHandler = new lambda.Function(this, "DefaultHandler", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("./backend/src/lambdas/defaultHandler"),
      logRetention: logs.RetentionDays.ONE_WEEK,
    })
    
    this.disconnectHandler = new lambda.Function(this, "DisconnectHandler", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("./backend/src/lambdas/disconnectHandler"),
      logRetention: logs.RetentionDays.ONE_WEEK,
      environment: {
        TABLE_NAME: socketHandlersProps.table.tableName,
      }
    })

    socketHandlersProps.table.grantWriteData(this.disconnectHandler);

    this.sendMessageHandler = new lambda.Function(this, "SendMessageHandler", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("./backend/src/lambdas/sendMessageHandler"),
      logRetention: logs.RetentionDays.ONE_WEEK,
      environment: {
        TABLE_NAME: socketHandlersProps.table.tableName,
      }
    })

    socketHandlersProps.table.grantReadWriteData(this.sendMessageHandler);
  }
}