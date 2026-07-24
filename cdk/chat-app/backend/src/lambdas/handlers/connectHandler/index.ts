import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayEvent } from "aws-lambda";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (
  event: APIGatewayEvent
): Promise<{ statusCode: number }> => {
  const command = new PutCommand({
    TableName: process.env.CONNECTION_TABLE_NAME!,
    Item: {
      userId: event.requestContext.authorizer?.userId,
      connectionId: event.requestContext.connectionId,
      email: event.requestContext.authorizer?.email,
    },
  });

  try {
    await docClient.send(command);

    return {
      statusCode: 200,
    };
  } catch (err) {
    console.error(err);

    return {
      statusCode: 500,
    };
  }
};