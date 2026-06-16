import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { StackPropsWithConfig } from "../../types/stack";
import { StorageStack } from "./storage";
import { DynamoDBStack } from "./dynamodb";
import { ComputeStack } from "./compute";

interface AppsStackProps extends StackPropsWithConfig {
  vpc: ec2.IVpc;
}

export class AppsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AppsStackProps) {
    super(scope, id, props);

    const dynamodbStack = new DynamoDBStack(this, "DynamoDBStack", props);
    
    const storageStack = new StorageStack(this, "StorageStack", props);
     
    new ComputeStack(this, "ComputeStack", {
      ...props,
      table: dynamodbStack.table,
      sqsQueue: storageStack.sqsQueue,
    });
  }
}