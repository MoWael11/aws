import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';


export class CognitoConstruct extends Construct {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly userPoolDomain: cognito.UserPoolDomain;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.userPool = new cognito.UserPool(this, 'UserPool', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      selfSignUpEnabled: true,
      userPoolName: 'UserPool',
       signInAliases: {
        email: true, 
        username: false,
        phone: false,
      },
      autoVerify: {
        email: true
      },
    });
    
    this.userPoolDomain = this.userPool.addDomain('UserPoolDomain', {
      managedLoginVersion: cognito.ManagedLoginVersion.NEWER_MANAGED_LOGIN,
      cognitoDomain: {
        domainPrefix: 'chat-app-q3941',
      },
    });

    this.userPoolClient = this.userPool.addClient('UserPoolClient', {
      userPoolClientName: 'ChatApp',
    });

    new cognito.CfnManagedLoginBranding(this, 'ManagedLoginBranding', {
      userPoolId: this.userPool.userPoolId,
      clientId: this.userPoolClient.userPoolClientId,
      useCognitoProvidedValues: true,
    });
  }
}