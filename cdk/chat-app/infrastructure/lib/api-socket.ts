import { WebSocketLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { WebSocketLambdaAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { SocketHandlersConstrcut } from "./socket-handlers";
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';

interface ApiSocketConstructProps {
  socketHandlers: SocketHandlersConstrcut;
  userpool: cognito.UserPool;
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
      identitySource: ['route.request.querystring.Auth']
    });

    this.webSocketApi = new apigwv2.WebSocketApi(this, 'WebSocketApi', {
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
      stageName: 'prod',
      autoDeploy: true,
    });

    this.webScoketUrl = webSocketStage.url;

    this.webSocketApi.grantManageConnections(sendMessageHandler)
    this.webSocketApi.grantManageConnections(defaultHandler)
  }
}