import { Construct } from 'constructs';
import { MessagesLambdaConstruct } from './messages-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';

interface MessagesApiConstructProps {
  messagesLambda: MessagesLambdaConstruct;
  userpool: cognito.UserPool;
}

export class MessagesApiConstruct extends Construct {
  public readonly api: apigateway.RestApi;
  public readonly getMessagesIntegration: apigateway.LambdaIntegration;
  public readonly restApiUrl: string;

  constructor(scope: Construct, id: string, props: MessagesApiConstructProps) {
    super(scope, id);

    this.api = new apigateway.RestApi(this, 'MessagesApi', {
      restApiName: 'Messages Service',
      description: 'This service serves messages.',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
          'X-Requested-With'
        ],
      }
    });

    this.restApiUrl = this.api.url;
    
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'AuthorizerApi', {
      cognitoUserPools: [props.userpool],
      authorizerName: 'CognitoAPIAuthorizer',
      identitySource: 'method.request.header.Authorization', // Cerca il token nell'header Authorization
    });

    const messages = this.api.root.addResource('messages');
    
    messages.addMethod('GET', new apigateway.LambdaIntegration(props.messagesLambda.getMessagesLambda), {
      authorizer: authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
  }
}