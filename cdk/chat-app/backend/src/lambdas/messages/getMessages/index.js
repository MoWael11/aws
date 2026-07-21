const { DynamoDBClient } = require("@aws-sdk/client-dynamodb")
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb")
const { ApiGatewayManagementApiClient, PostToConnectionCommand } = require("@aws-sdk/client-apigatewaymanagementapi")
const { sendResponse } = require("../../../shared/response")

exports.handler = async function (event) {
  const client = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(client);

  const ddbcommand = new ScanCommand({
    TableName: process.env.MESSAGE_TABLE_NAME
  })

  try {
    const messages = await docClient.send(ddbcommand);
    return sendResponse(200, {messages: messages.Items});
  } catch (err) {
    console.log(err)
    return sendResponse(500, { error: "Failed to fetch messages" });
  }
}