import AWS from 'aws-sdk';
import config from './config/index.js';
import { v4 as uuidv4 } from 'uuid';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const handler = async (event) => {
  try {

    const shortCode = event.pathParameters?.shortCode;
    const userId = event.requestContext?.authorizer?.claims?.sub;

    if (!shortCode) {
      return {
          statusCode: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            "Access-Control-Allow-Headers": "Content-Type",
          },
          body: JSON.stringify({ error: "ShortCode is required" }),
      };
    }

    const params = {
      TableName: config.DYNAMODB_CLOUDSNIPS_TABLE_NAME,
      Key: {
        userId: userId, 
        shortCode: shortCode,
      },
      ReturnValues: 'ALL_OLD'
    };

    const result = await dynamoDB.delete(params).promise();

    if (result.Attributes) {

      const timestamp = new Date().toISOString();

      await dynamoDB.put({
        TableName: config.DYNAMODB_CLOUDSNIPS_EVENT_TABLE_NAME,
        Item: {
            eventId: uuidv4(),
            userId: userId,
            timestamp: timestamp,
            eventType: "CLOUDSNIP_DELETED",
            shortCode
        }
    }).promise();


      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({ message: "CloudSnip deleted successfully" }),
      };
    } else {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({ message: "CloudSnip not found" }),
      };
    }
  } catch (error) {
    console.error("DynamoDB Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ error: "Failed to delete CloudSnip", details: error.message }),
    };
  }
};
