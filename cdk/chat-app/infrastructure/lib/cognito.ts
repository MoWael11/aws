import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import { Config } from '../types/config';


export class CognitoConstruct extends Construct {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly userPoolDomain: cognito.UserPoolDomain;

  constructor(scope: Construct, id: string, config: Config) {
    super(scope, id);

    this.userPool = new cognito.UserPool(this, 'UserPool', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      selfSignUpEnabled: true,
      userPoolName: `${config.env}-${config.projectName}-user-pool`,
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
        domainPrefix: `${config.env}-${config.projectName}-domain`,
      },
    });

    this.userPoolClient = this.userPool.addClient('UserPoolClient', {
      userPoolClientName: `${config.env}-${config.projectName}-user-pool-client`,
    });

    new cognito.CfnManagedLoginBranding(this, 'ManagedLoginBranding', {
      userPoolId: this.userPool.userPoolId,
      clientId: this.userPoolClient.userPoolClientId,
      useCognitoProvidedValues: true,
    });
  }
}