import { WebSocketLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { WebSocketLambdaAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { SocketHandlersConstrcut } from "./socket-handlers";
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Config } from '../types/config';

interface ApiSocketConstructProps {
  socketHandlers: SocketHandlersConstrcut;
  userpool: cognito.UserPool;
  config: Config
}

export class ApiSocketConstruct extends Construct {
  public readonly webScoketUrl: string;
  private readonly webSocketApi: apigwv2.WebSocketApi;

  constructor(scope: Construct, id: string, props: ApiSocketConstructProps) {
    super(scope, id);

    const authHandler = props.socketHandlers.authHandler;
    const connectHandler = props.socketHandlers.connectHandler;
    const disconnectHandler = props.socketHandlers.disconnectHandler;
    const defaultHandler = props.socketHandlers.defaultHandler;
    const sendMessageHandler = props.socketHandlers.sendMessageHandler;

    const authorizer = new WebSocketLambdaAuthorizer('WsAuthorizer', authHandler, {
      authorizerName: `${props.config.env}-${props.config.projectName}-ws-authorizer`,
      identitySource: ['route.request.querystring.Auth']
    });

    this.webSocketApi = new apigwv2.WebSocketApi(this, 'WebSocketApi', {
      apiName: `${props.config.env}-${props.config.projectName}-websocket-api`,
      connectRouteOptions: {
        integration: new WebSocketLambdaIntegration('ConnectIntegration', connectHandler),
        authorizer
      },
      disconnectRouteOptions: { integration: new WebSocketLambdaIntegration('DisconnectIntegration', disconnectHandler) },
      defaultRouteOptions: { integration: new WebSocketLambdaIntegration('DefaultIntegration', defaultHandler) },
    });

    this.webSocketApi.addRoute('sendMessage', {
      integration: new WebSocketLambdaIntegration('SendMessageIntegration', sendMessageHandler),
    });

    const webSocketStage = new apigwv2.WebSocketStage(this, 'mystage', {
      webSocketApi: this.webSocketApi,
      stageName: `${props.config.env}`,
      autoDeploy: true,
    });

    this.webScoketUrl = webSocketStage.url;

    this.webSocketApi.grantManageConnections(sendMessageHandler)
    this.webSocketApi.grantManageConnections(defaultHandler)
  }
}