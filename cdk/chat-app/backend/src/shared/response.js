const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS,PUT,DELETE"
};

const sendResponse = (statusCode, bodyObject) => {
  return {
    statusCode: statusCode,
    headers: corsHeaders,
    body: JSON.stringify(bodyObject)
  };
};

module.exports = { sendResponse };
