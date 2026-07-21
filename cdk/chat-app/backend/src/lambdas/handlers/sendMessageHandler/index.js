const { DynamoDBClient } = require("@aws-sdk/client-dynamodb")
const { DynamoDBDocumentClient, ScanCommand, PutCommand } = require("@aws-sdk/lib-dynamodb")
const { ApiGatewayManagementApiClient, PostToConnectionCommand } = require("@aws-sdk/client-apigatewaymanagementapi")
const crypto = require("crypto");

exports.handler = async function (event) {

  const client = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(client);

  const connectionsCommand = new ScanCommand({
    TableName: process.env.CONNECTION_TABLE_NAME
  })

  let connections;
  try {
    connections = await docClient.send(connectionsCommand);
  } catch (err) {
    console.log(err)
    return {
      statusCode: 500,
    };
  }

  const userConnection = connections.Items.find(({ connectionId }) => connectionId === event.requestContext.connectionId);
  if (!userConnection) {
    return {
      statusCode: 400,
      body: "User connection not found."
    };
  }

  const message = JSON.parse(event.body).message;
  const email = userConnection.email;

  // create db message
  const messageCommand = new PutCommand({
    TableName: process.env.MESSAGE_TABLE_NAME,
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
    console.log(err)
    return {
      statusCode: 500,
    };
  }

  const callbackAPI = new ApiGatewayManagementApiClient({
    apiVersion: '2018-11-29',
    endpoint: 'https://' + event.requestContext.domainName + '/' + event.requestContext.stage,
  });

  const sendMessages = connections.Items.map(async ({ connectionId }) => {
    if (connectionId !== event.requestContext.connectionId) {
      try {
        await callbackAPI.send(new PostToConnectionCommand(
          { ConnectionId: connectionId, Data: JSON.stringify({ text: message, email }) }
        ));
      } catch (e) {
        console.log(e);
      }
    }
  });

  try {
    await Promise.all(sendMessages)
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
    };
  }

  return { statusCode: 200 };
};
