import * as cdk from 'aws-cdk-lib';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { StackPropsWithConfig } from "../../types/stack";
import { DynamoDBConstruct } from "./dynamodb";
import { IngestionConstruct } from "./ingestion";
interface AppsStackProps extends StackPropsWithConfig {
  vpc: ec2.IVpc;
}

export class AppsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AppsStackProps) {
    super(scope, id, props);

    const dynamodbConstruct = new DynamoDBConstruct(this, "DynamoDBConstruct");
    
    new IngestionConstruct(this, "IngestionConstruct", {
      config: props.config,
      table: dynamodbConstruct.table,
      vpc: props.vpc,
    });
  }
}