import AWS from 'aws-sdk';
import config from './config/index.js';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const handler = async (event) => {
    try {
        const shortCode = event.pathParameters?.shortCode;
        const userId = event.requestContext.authorizer.claims.sub;

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
            KeyConditionExpression: 'userId = :userId and shortCode = :shortCode',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':shortCode': shortCode,
            },
        };

        const result = await dynamoDB.query(params).promise();

        if (!result.Items || result.Items.length === 0 || !result.Items[0].isValid || !result.Items[0].isActive) {
            return {
                statusCode: 404,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
                body: JSON.stringify({ message: "CloudSnip does not exist or is not active and valid." }),
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
            body: JSON.stringify(result.Items[0])
        };

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
            body: JSON.stringify({ error: "Failed to get CloudSnip", details: error.message }),
        };
    }
};
