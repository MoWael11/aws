import boto3
import json

client = boto3.client('dynamodb')

def lambda_handler(event, context):
    print(json.dumps(event, indent=2))

    for msg in event["Records"]:
        # 1. SQS body -> SNS notification
        sns_message = json.loads(msg["body"])

        # 2. SNS Message -> EventBridge S3 event
        s3_event = json.loads(sns_message["Message"])

        # 3. Estrazione dati usando la struttura di EventBridge
        fileKey = s3_event["detail"]["object"]["key"]
        timestamp = s3_event["time"]

        # 4. Scrittura su DynamoDB
        response = client.put_item(
            TableName='filemanager-dev-table',
            Item={
                'FileKey': {
                    'S': fileKey
                },
                'Timestamp': {
                    'S': timestamp
                }
            }
        )

    return {
        "statusCode": 200,
        "body": {
            "message": "Item successfully stored in DynamoDB"
        }
    }