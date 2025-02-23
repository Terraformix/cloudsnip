import AWS from 'aws-sdk';
import config from './config/index.js';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const handler = async (event) => {
  try {
    const userId = event.requestContext?.authorizer?.claims?.sub;
    
    const params = {
      TableName: config.DYNAMODB_CLOUDSNIPS_TABLE_NAME,
      KeyConditionExpression: 'userId = :userId',
      FilterExpression: 'isValid = :valid', 
      ExpressionAttributeValues: {
        ':userId': userId,
        ':valid': true
      }
    };

    const result = await dynamoDB.query(params).promise();

    if (!result.Items || result.Items.length === 0) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({ error: "No active CloudSnips found." }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    console.error("Error:", error.message);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ error: "Failed to get CloudSnips", details: error.message }),
    };
  }
};
