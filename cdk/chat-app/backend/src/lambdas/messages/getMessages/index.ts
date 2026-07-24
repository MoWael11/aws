import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import { sendResponse } from "../../../shared/response";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (
  event: APIGatewayProxyWebsocketEventV2
) => {
  const ddbCommand = new ScanCommand({
    TableName: process.env.MESSAGE_TABLE_NAME!,
  });

  try {
    const messages = await docClient.send(ddbCommand);

    return sendResponse(200, {
      messages: messages.Items ?? [],
    });
  } catch (err) {
    console.error(err);

    return sendResponse(500, {
      error: "Failed to fetch messages",
    });
  }
};