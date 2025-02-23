import AWS from 'aws-sdk';
import config from './config/index.js';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PATCH",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const handler = async (event) => {
  try {
    const requestBody = JSON.parse(event.body); // 'renew' or 'expire'
    const { action } = requestBody;
    const shortCode = event.pathParameters?.shortCode;
    const userId = event.requestContext.authorizer.claims.sub;

    if (!shortCode) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "ShortCode is required" }),
      };
    }

    if (!['renew', 'expire'].includes(action)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid action. Use "renew" or "expire".' }),
      };
    }

    const getParams = {
      TableName: config.DYNAMODB_CLOUDSNIPS_TABLE_NAME,
      KeyConditionExpression: 'userId = :userId and shortCode = :shortCode',
      ExpressionAttributeValues: {
          ':userId': userId,
          ':shortCode': shortCode,
      },
    };

    const getResult = await dynamoDB.query(getParams).promise();




    if (!getResult.Items || getResult.Items.length === 0) {
        return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ message: "CloudSnip does not exist" }),
        };
    }

    const existingCloudSnip = getResult.Items[0];


    const updateParams = {
      TableName: config.DYNAMODB_CLOUDSNIPS_TABLE_NAME,
      Key: { userId, shortCode },
      UpdateExpression: '',
      ExpressionAttributeValues: {},
      ReturnValues: 'ALL_NEW',
    };

    // If the action is 'renew'
    if (action === 'renew') {
      const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // Extend by 30 days
      updateParams.UpdateExpression = 'SET isActive = :isActive, expiresAt = :expiresAt';
      updateParams.ExpressionAttributeValues = {
        ':isActive': true,
        ':expiresAt': newExpiresAt,
      };
    } else if (action === 'expire') {
      // If the action is 'expire'
      updateParams.UpdateExpression = 'SET isActive = :isActive';
      updateParams.ExpressionAttributeValues = {
        ':isActive': false,
      };
    }

    const updateResult = await dynamoDB.update(updateParams).promise();

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: action === 'renew' ? "CloudSnip renewed successfully" : "CloudSnip expired successfully",
        link: updateResult.Attributes,
      }),
    };
  } catch (error) {
    console.error("DynamoDB Error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Failed to update CloudSnip status", details: error.message }),
    };
  }
};
