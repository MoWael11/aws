import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { NestedStackPropsWithConfig } from "../../types/stack";

export class VpcStack extends cdk.NestedStack {
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props: NestedStackPropsWithConfig) {
    super(scope, id, props);

    const cidr = props.config.infra.cidr;
    const cidrMask = props.config.infra.cidrMask;
    
    this.vpc = new ec2.Vpc(this, "Vpc", {
      ipAddresses: ec2.IpAddresses.cidr(cidr),
      maxAzs: 2,
      subnetConfiguration: [
        {
          name: "Public",
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: cidrMask,
        },
        {
          name: "Private",
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: cidrMask,
        },
      ],
      gatewayEndpoints: {
        dyanamodb: {
          service: ec2.GatewayVpcEndpointAwsService.DYNAMODB,
        },
      }
    });

  }

}