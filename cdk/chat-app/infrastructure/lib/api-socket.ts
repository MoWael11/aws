import { WebSocketLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { SocketHandlers } from "./socket-handlers";
import { Construct } from 'constructs';

interface ApiSocketConstructProps {
  socketHandlers: SocketHandlers;
}

export class ApiSocketConstruct extends Construct {
  public readonly webScoketUrl: string;
  private readonly webSocketApi: apigwv2.WebSocketApi;

  constructor(scope: Construct, id: string, props: ApiSocketConstructProps) {
    super(scope, id);

    const connectHandler = props.socketHandlers.connectHandler;
    const disconnectHandler = props.socketHandlers.disconnectHandler;
    const defaultHandler = props.socketHandlers.defaultHandler;
    const sendMessageHandler = props.socketHandlers.sendMessageHandler;

    this.webSocketApi = new apigwv2.WebSocketApi(this, 'WebSocketApi', {
      connectRouteOptions: { integration: new WebSocketLambdaIntegration('ConnectIntegration', connectHandler) },
      disconnectRouteOptions: { integration: new WebSocketLambdaIntegration('DisconnectIntegration', disconnectHandler) },
      defaultRouteOptions: { integration: new WebSocketLambdaIntegration('DefaultIntegration', defaultHandler) },
    });

    this.webSocketApi.addRoute('sendMessage', {
      integration: new WebSocketLambdaIntegration('SendMessageIntegration', sendMessageHandler),
    });

    const webSocketStage = new apigwv2.WebSocketStage(this, 'mystage', {
      webSocketApi: this.webSocketApi,
      stageName: 'prod',
      description: 'Stage',
      autoDeploy: true,
    });

    this.webScoketUrl = webSocketStage.url;

    this.webSocketApi.grantManageConnections(sendMessageHandler)
  }
}