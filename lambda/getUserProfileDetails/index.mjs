import AWS from 'aws-sdk';
import config from './config/index.js';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
    "Access-Control-Allow-Headers": "Content-Type",
};

export const handler = async (event) => {
    try {
        const userId = event.requestContext.authorizer.claims.sub;

        const userParams = {
            TableName: config.DYNAMODB_CLOUDSNIP_USERS_TABLE_NAME,
            Key: {
                userId: userId
            }
        };

        const userResult = await dynamoDB.get(userParams).promise();
        const userData = userResult.Item || null;

        if (!userData) {
            return {
                statusCode: 404,
                headers: corsHeaders,
                body: JSON.stringify({ error: "User not found." }),
            };
        }

        const cloudSnipParams = {
            TableName: config.DYNAMODB_CLOUDSNIPS_TABLE_NAME,
            FilterExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        };

        const cloudSnipResultsResult = await dynamoDB.scan(cloudSnipParams).promise();
        const cloudSnips = cloudSnipResultsResult.Items || [];

        const activeCloudSnips = cloudSnips.filter(link => link.isActive === true).length;
        const inactiveCloudSnips = cloudSnips.filter(link => link.isActive === false).length;
        const validCloudSnips = cloudSnips.filter(link => link.isValid === true).length;
        const invalidCloudSnips = cloudSnips.filter(link => link.isValid === false).length;

        const createdEventsParams = {
            TableName: config.DYNAMODB_CLOUDSNIPS_EVENT_TABLE_NAME,
            FilterExpression: 'userId = :userId AND eventType = :createdEventType',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':createdEventType': 'CLOUDSNIP_CREATED'
            },
            Select: 'COUNT'
        };

        const deletedEventsParams = {
            TableName: config.DYNAMODB_CLOUDSNIPS_EVENT_TABLE_NAME,
            FilterExpression: 'userId = :userId AND eventType = :deletedEventType',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':deletedEventType': 'CLOUDSNIP_DELETED'
            },
            Select: 'COUNT'
        };

        const createdEventsResult = await dynamoDB.scan(createdEventsParams).promise();
        const totalCloudSnips = createdEventsResult.Count || 0;

        const deletedEventsResult = await dynamoDB.scan(deletedEventsParams).promise();
        const deletedCloudSnips = deletedEventsResult.Count || 0;

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                user: userData,
                statistics: {
                    activeCloudSnips,
                    inactiveCloudSnips,
                    validCloudSnips,
                    invalidCloudSnips,
                    totalCloudSnips,
                    deletedCloudSnips
                }
            }),
        };

    } catch (error) {
        console.error("Error fetching user profile:", error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: "Failed to retrieve user profile." }),
        };
    }
};
