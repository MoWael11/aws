import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import crypto from "crypto";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

interface Connection {
  connectionId: string;
  email: string;
}

interface MessagePayload {
  message: string;
}

export const handler = async (
  event: APIGatewayProxyWebsocketEventV2
): Promise<{ statusCode: number; body?: string }> => {
  const connectionsCommand = new ScanCommand({
    TableName: process.env.CONNECTION_TABLE_NAME!,
  });

  let connections: Connection[] = [];

  try {
    const result = await docClient.send(connectionsCommand);

    connections = (result.Items ?? []) as Connection[];
  } catch (err) {
    console.error(err);

    return {
      statusCode: 500,
    };
  }

  const userConnection = connections.find(
    ({ connectionId }) =>
      connectionId === event.requestContext.connectionId
  );

  if (!userConnection) {
    return {
      statusCode: 400,
      body: "User connection not found.",
    };
  }

  const { message } = JSON.parse(event.body ?? "{}") as MessagePayload;

  const email = userConnection.email;

  const messageCommand = new PutCommand({
    TableName: process.env.MESSAGE_TABLE_NAME!,
    Item: {
      email,
      messageId: crypto.randomUUID(),
      text: message,
      timestamp: new Date().toISOString(),
    },
  });

  try {
    await docClient.send(messageCommand);
  } catch (err) {
    console.error(err);

    return {
      statusCode: 500,
    };
  }

  const callbackAPI = new ApiGatewayManagementApiClient({
    apiVersion: "2018-11-29",
    endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`,
  });

  const sendMessages = connections.map(
    async ({ connectionId }) => {
      if (connectionId === event.requestContext.connectionId) {
        return;
      }

      try {
        await callbackAPI.send(
          new PostToConnectionCommand({
            ConnectionId: connectionId,
            Data: JSON.stringify({
              text: message,
              email,
            }),
          })
        );
      } catch (err) {
        console.error(err);
      }
    }
  );

  try {
    await Promise.all(sendMessages);
  } catch (err) {
    console.error(err);

    return {
      statusCode: 500,
    };
  }

  return {
    statusCode: 200,
  };
};