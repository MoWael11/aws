import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as cdk from 'aws-cdk-lib';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as path from 'path';
import { Construct } from "constructs";
import { execSync } from 'child_process';
import * as fs from 'fs';

interface WebsiteConstructProps {
  restEndpoint: string;
  wsEndpoint: string;
  userPoolClient: cognito.UserPoolClient;
  userPoolClientId: string;
  cognitoAuthority: string;
  cognitoDomain: string;
}

export class WebsiteConstruct extends Construct {
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: WebsiteConstructProps) {
    super(scope, id);

    const frontendPath = path.join(__dirname, '../../frontend');

    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true,
      autoDeleteObjects: true,
    });

    this.distribution = new cloudfront.Distribution(this, 'CloudFrontDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
      },
      defaultRootObject: 'index.html',
    });

    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [
        // build the app and copy dist folder
        s3deploy.Source.asset(frontendPath, {
          bundling: {
            image: cdk.DockerImage.fromRegistry('node:20-alpine'),

            local: {
              tryBundle(outputDir: string) {
                try {
                  execSync('npm ci && npm run build', { cwd: frontendPath, stdio: 'inherit' });

                  fs.cpSync(path.join(frontendPath, 'dist'), outputDir, { recursive: true });

                  return true;
                } catch {
                  return false;
                }
              }
            }
          }
        }),

        // create config.js with dynamic vars
        s3deploy.Source.data('config.js',
          `window.APP_CONFIG = {
            APP_URL: "https://${this.distribution.domainName}",
          
            REST_ENDPOINT: "${props.restEndpoint}",
            WS_ENDPOINT: "${props.wsEndpoint}",
          
            CONGITO_AUTHORITY: "${props.cognitoAuthority}",
            CONGITO_CLIENT_ID: "${props.userPoolClientId}",
            CONGITO_DOMAIN: "${props.cognitoDomain}"
          }`
        )
      ],
      destinationBucket: websiteBucket,
      distribution: this.distribution,
      distributionPaths: ['/*'], // invalidation for cloudfront
    });


    const cfnUserPoolClient = props.userPoolClient.node.defaultChild as cognito.CfnUserPoolClient;
    cfnUserPoolClient.callbackUrLs = [`https://${this.distribution.domainName}`];
    cfnUserPoolClient.logoutUrLs = [`https://${this.distribution.domainName}`];
  }
}