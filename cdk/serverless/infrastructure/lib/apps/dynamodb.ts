import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class DynamoDBConstruct extends Construct {
  public readonly table: dynamodb.Table;
  
  constructor(scope: Construct, id: string) {
    super(scope, id);
    
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