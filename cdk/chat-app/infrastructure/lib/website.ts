import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from "constructs";

interface WebsiteConstructProps {
  socketEndpoint: string;
}

export class WebsiteConstruct extends Construct {
  constructor(scope: Construct, id: string, props: WebsiteConstructProps) {
    super(scope, id);

    const assetBucket = new s3.Bucket(this, 'AssetBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true,
    });

    // s3deploy to deploy the frontend assets to the S3 bucket
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('./frontend'),
      s3deploy.Source.jsonData('config.json', {
        socketEndpoint: props.socketEndpoint,
      })
      ],
      destinationBucket: assetBucket,
    });

    // cloudfront 
    new cloudfront.Distribution(this, 'CloudFrontDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(assetBucket),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
      },
      defaultRootObject: 'index.html',
    });

  }
}