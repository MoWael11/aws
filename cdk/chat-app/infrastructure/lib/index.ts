import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { SocketHandlers } from './socket-handlers';
import { WebsiteConstruct } from './website';
import { DynamoDBConstruct } from './dynamodb';
import { ApiSocketConstruct } from './api-socket';

export class ChatAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dynamoDBConstruct = new DynamoDBConstruct(this, 'DynamoDBConstruct');

    const socketHandlers = new SocketHandlers(this, 'SocketHandlers', {
      table: dynamoDBConstruct.table,
    });

    const apiSocketConstruct = new ApiSocketConstruct(this, 'ApiSocketConstruct', {
      socketHandlers: socketHandlers,
    });
    
    new WebsiteConstruct(this, 'WebsiteConstruct', {
      socketEndpoint: apiSocketConstruct.webScoketUrl
    });
  }
}
