import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (
  event: APIGatewayProxyWebsocketEventV2
): Promise<{ statusCode: number }> => {
  const command = new DeleteCommand({
    TableName: process.env.CONNECTION_TABLE_NAME!,
    Key: {
      connectionId: event.requestContext.connectionId,
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