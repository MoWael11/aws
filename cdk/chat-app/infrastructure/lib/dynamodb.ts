import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import { Config } from '../types/config';

export class DynamoDBConstruct extends Construct {
  public readonly connectionTable: dynamodb.Table;
  public readonly messageTable: dynamodb.Table;

  constructor(scope: Construct, id: string, config: Config) {
    super(scope, id);

    // to make it unique per user
    this.connectionTable = new dynamodb.Table(this, "ConnectionTable", {
      tableName: `${config.env}-${config.dynamodbTableName}-connections`,
      partitionKey: {
        name: "userId",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    this.messageTable = new dynamodb.Table(this, "MessageTable", {
      tableName: `${config.env}-${config.dynamodbTableName}-messages`,
      partitionKey: {
        name: "messageId",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "timestamp",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }

}