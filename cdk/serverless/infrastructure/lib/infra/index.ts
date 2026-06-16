import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { StackPropsWithConfig } from '../../types/stack';
import { VpcStack } from './vpc';

export class InfraStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props: StackPropsWithConfig) {
    super(scope, id, props);

    const vpc = new VpcStack(this, "Vpc", props);
    this.vpc = vpc.vpc;
  }
}
