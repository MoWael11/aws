import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import dynamodb = require('aws-cdk-lib/aws-dynamodb');
import { NestedStackPropsWithConfig } from '../../types/stack';

export class DynamoDBStack extends cdk.NestedStack {
  public readonly table: dynamodb.Table;
  
  constructor(scope: Construct, id: string, props: NestedStackPropsWithConfig) {
    super(scope, id, props);
    
    this.table = new dynamodb.Table(this, "Table", {
      partitionKey: {
        name: "FileKey",
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: "Timestamp",
        type: dynamodb.AttributeType.STRING
      },
    });
  }
}