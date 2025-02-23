import shortid from 'shortid';
import config from './config/index.js';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const sqs = new AWS.SQS();
const sns = new AWS.SNS();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const handler = async (event) => {
    try {
        const requestBody = JSON.parse(event.body);
        const { originalUrl } = requestBody;
        const userId = event.requestContext?.authorizer?.claims?.sub;

        if (!originalUrl) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
                body: JSON.stringify({
                    error: "Original URL is required"
                })
            };
        }

        const shortCode = shortid.generate();
        const shortUrl = `${process.env.API_GATEWAY_URL || "https://50wzdgrykb.execute-api.us-east-1.amazonaws.com/test"}/api/cloudsnips/${shortCode}`;

        const cloudSnipItem = {
            shortCode,
            shortUrl,
            originalUrl,
            userId,
            isActive: true,
            isValid: false,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };

        await dynamoDB.put({
            TableName: config.DYNAMODB_CLOUDSNIPS_TABLE_NAME,
            Item: cloudSnipItem
        }).promise();

        const timestamp = new Date().toISOString();

        await dynamoDB.put({
            TableName: config.DYNAMODB_CLOUDSNIPS_EVENT_TABLE_NAME,
            Item: {
                eventId: uuidv4(),
                userId: userId,
                timestamp: timestamp,
                eventType: "CLOUDSNIP_CREATED",
                shortCode
            }
        }).promise();

        await sqs.sendMessage({
            QueueUrl: config.CLOUDSNIP_QUEUE_URL,
            MessageBody: JSON.stringify({
                action: 'CLOUDSNIP_CREATED',
                shortCode,
                userId,
                originalUrl
            })
        }).promise();

        const snsParams = {
            Message: `🚀 New CloudSnip Created! 🚀
            📅 Date & Time: ${cloudSnipItem.createdAt}
            👤 User ID: ${userId}
            🔗 Original URL: ${originalUrl}
            🔗 CloudSnip code: ${cloudSnipItem.shortCode}`,
            Subject: "New CloudSnip Created",
            TopicArn: config.CLOUDSNIP_SNS_ARN
        };

        await sns.publish(snsParams).promise();

        return {
            statusCode: 201,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({
                message: "CloudSnip created successfully",
                cloudSnip: cloudSnipItem 
            })
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
            body: JSON.stringify({
                error: error.message
            })
        };
    }
};

