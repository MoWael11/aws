import boto3
import os
import json

client = boto3.client('dynamodb')

def lambda_handler(event, context):
    TableName = os.environ['TABLE_NAME']
    for msg in event["Records"]:

        s3_event = json.loads(msg["body"])

        record = s3_event["Records"][0]

        fileKey = record["s3"]["object"]["key"]
        timestamp = record["eventTime"]


        response = client.put_item(
            TableName=TableName,
            Item={
                    'FileKey': {
                        "S": fileKey
                    },
                    'Timestamp':{"S": timestamp}
                }
        )

    return {
        "statusCode": 200,
        "body": {
            "message": "Item successfully stored in DynamoDB",
            "requestId": response["ResponseMetadata"]["RequestId"]}
    }