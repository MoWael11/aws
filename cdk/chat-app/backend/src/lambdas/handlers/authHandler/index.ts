import { CognitoJwtVerifier } from "aws-jwt-verify";
import {
  APIGatewayRequestAuthorizerEvent,
  APIGatewayAuthorizerResult,
  APIGatewayAuthorizerResultContext,
} from "aws-lambda";

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID!,
  clientId: process.env.CLIENT_ID!,
  tokenUse: "id",
});

export const handler = async (
  event: APIGatewayRequestAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  try {
    const tokenId = event.queryStringParameters?.Auth;

    if (!tokenId) {
      throw new Error("Missing authorization token id.");
    }

    const payload = await verifier.verify(tokenId);

    return generatePolicy("user", "Allow", event.methodArn, {
      userId: payload.sub,
      email: payload.email as string ?? "",
    });
  } catch (err) {
    console.error(err);

    return generatePolicy("anonymous", "Deny", event.methodArn);
  }
};

function generatePolicy(
  principalId: string,
  effect: "Allow" | "Deny",
  resource: string,
  context?: APIGatewayAuthorizerResultContext
): APIGatewayAuthorizerResult {
  return {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    },
    context: context ?? {},
  };
}