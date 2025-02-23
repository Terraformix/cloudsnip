import AWS from 'aws-sdk';
import config from './config/index.js';

const s3 = new AWS.S3();
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
    "Access-Control-Allow-Headers": "Content-Type",
  };

export const handler = async (event) => {
    try {
        const { imageData, mimeType } = JSON.parse(event.body);
        const userId = event.requestContext?.authorizer?.claims?.sub;

        if (!imageData || !mimeType || !userId) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ message: "Invalid request: missing image data, MIME type, or user ID." }),
            };
        }

        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        const fileExtension = mimeType.split('/')[1];

        const key = `uploads/${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

        const getUserParams = {
            TableName: config.DYNAMODB_CLOUDSNIP_USERS_TABLE_NAME,
            Key: { userId },
        };
        
        const userResult = await dynamoDb.get(getUserParams).promise();

        if (userResult?.Item?.avatarUrl) {
            const existingAvatarKey = userResult.Item.avatarUrl.split('.amazonaws.com/')[1];

            const deleteParams = {
                Bucket: config.CLOUDSNIP_S3_BUCKET_NAME,
                Key: existingAvatarKey,
            };
            await s3.deleteObject(deleteParams).promise();
        }

        const uploadParams = {
            Bucket: config.CLOUDSNIP_S3_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: mimeType
        };

        const uploadResult = await s3.upload(uploadParams).promise();
        const s3Url = uploadResult.Location;

        const updateParams = {
            TableName: config.DYNAMODB_CLOUDSNIP_USERS_TABLE_NAME,
            Key: { userId },
            UpdateExpression: 'SET avatarUrl = :avatarUrl',
            ExpressionAttributeValues: {
                ':avatarUrl': s3Url,
            },
            ReturnValues: 'ALL_NEW',
        };

        await dynamoDb.update(updateParams).promise();

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                message: 'Avatar uploaded successfully',
                avatarUrl: s3Url
            }),
        };
    } catch (error) {
        console.error("Error uploading image:", error);

        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                message: 'Error uploading image or updating user',
                error: error.message,
            }),
        };
    }
};
