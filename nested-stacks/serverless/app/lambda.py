import boto3
import json

client = boto3.client('dynamodb')

def lambda_handler(event, context):

    for msg in event["Records"]:

        s3_event = json.loads(msg["body"])

        record = s3_event["Records"][0]

        fileKey = record["s3"]["object"]["key"]
        timestamp = record["eventTime"]


        response = client.put_item(
            TableName='filemanager-dev-table',
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