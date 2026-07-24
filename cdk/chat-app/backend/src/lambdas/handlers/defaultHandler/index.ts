import {
  ApiGatewayManagementApiClient,
  GetConnectionCommand,
  GetConnectionCommandOutput,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";

export const handler = async (
  event: APIGatewayProxyWebsocketEventV2
): Promise<{ statusCode: number }> => {
  const connectionId = event.requestContext.connectionId;

  const callbackAPI = new ApiGatewayManagementApiClient({
    apiVersion: "2018-11-29",
    endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`,
  });

  let connectionInfo: GetConnectionCommandOutput | undefined;

  try {
    connectionInfo = await callbackAPI.send(
      new GetConnectionCommand({
        ConnectionId: connectionId,
      })
    );
  } catch (err) {
    console.error(err);
  }

  await callbackAPI.send(
    new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data:
        "Use the sendmessage route to send a message. Your info:" +
        JSON.stringify({
          ...connectionInfo,
          connectionId,
        }),
    })
  );

  return {
    statusCode: 200,
  };
};