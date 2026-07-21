const { CognitoJwtVerifier } = require("aws-jwt-verify");

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID,
  clientId: process.env.CLIENT_ID,
  tokenUse: "id",
});

exports.handler = async (event) => {
  try {
    const tokenId = event.queryStringParameters &&
      event.queryStringParameters.Auth;

    if (!tokenId) {
      throw new Error("Missing authorization token id.");
    }

    const payload = await verifier.verify(tokenId);

    return generatePolicy(
      "user",
      "Allow",
      event.methodArn,
      {
        userId: payload.sub,
        email: payload.email || ""
      }
    );

  } catch (err) {
    console.error(err);

    return generatePolicy(
      "anonymous",
      "Deny",
      event.methodArn
    );
  }
};

function generatePolicy(principalId, effect, resource, context) {
  return {
    principalId: principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource
        }
      ]
    },
    context: context || {}
  };
}