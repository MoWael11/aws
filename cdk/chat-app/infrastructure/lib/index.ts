import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { SocketHandlersConstrcut } from './socket-handlers';
import { WebsiteConstruct } from './website';
import { DynamoDBConstruct } from './dynamodb';
import { ApiSocketConstruct } from './api-socket';
import { MessagesLambdaConstruct } from './messages-lambda';
import { MessagesApiConstruct } from './messages-api';
import { CognitoConstruct } from './cognito';
import { StackPropsWithConfig } from '../types/stack';

export class ChatAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: StackPropsWithConfig) {
    super(scope, id, props);

    const dynamoDBConstruct = new DynamoDBConstruct(this, 'DynamoDBConstruct', props.config);

    const cognitoConstrcut = new CognitoConstruct(this, 'CognitoConstruct', props.config);

    const messagesLambdaConstruct = new MessagesLambdaConstruct(this, 'MessagesLambda', {
      messageTable: dynamoDBConstruct.messageTable,
      config: props.config
    });

    const messagesApiConstruct = new MessagesApiConstruct(this, 'MessagesApi', {
      messagesLambda: messagesLambdaConstruct,
      userpool: cognitoConstrcut.userPool,
      config: props.config
    });
    
    const socketHandlers = new SocketHandlersConstrcut(this, 'SocketHandlers', {
      connectionTable: dynamoDBConstruct.connectionTable,
      messageTable: dynamoDBConstruct.messageTable,
      userPool: cognitoConstrcut.userPool,
      userPoolClient: cognitoConstrcut.userPoolClient,
      config: props.config
    });

    const apiSocketConstruct = new ApiSocketConstruct(this, 'ApiSocketConstruct', {
      socketHandlers: socketHandlers,
      userpool: cognitoConstrcut.userPool,
      config: props.config
    });
    
    new WebsiteConstruct(this, 'WebsiteConstruct', {
      restEndpoint: messagesApiConstruct.restApiUrl,
      wsEndpoint: apiSocketConstruct.webScoketUrl,
      userPoolClient: cognitoConstrcut.userPoolClient,
      userPoolClientId: cognitoConstrcut.userPoolClient.userPoolClientId,
      cognitoDomain: cognitoConstrcut.userPoolDomain.domainName,
      cognitoAuthority: cognitoConstrcut.userPool.userPoolProviderUrl,
      config: props.config
    });
  }
}
