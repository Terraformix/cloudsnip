import AWS from 'aws-sdk';
import config from './config/index.js';

const cognito = new AWS.CognitoIdentityServiceProvider();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const handler = async (event) => {
    try {
        const requestBody = JSON.parse(event.body);
        const { email, password } = requestBody;

        if (!password || !email) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
                body: JSON.stringify({ message: "Email and password are required" }),
            };
        }

        let cognitoResponse;

        try {
            cognitoResponse = await cognito.signUp({
                ClientId: config.COGNITO_CLIENT_ID,
                Username: email,
                Password: password,
                UserAttributes: [{ Name: 'email', Value: email }],
            }).promise();
        } catch (cognitoError) {

            return {
                statusCode: cognitoError.code === "UsernameExistsException" ? 409 : 400,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
                body: JSON.stringify({ 
                    message: cognitoError.message || "Error signing up user",
                }),
            };
        }

        const userId = cognitoResponse.UserSub;

        try {
            await dynamoDB.put({
                TableName: config.DYNAMODB_CLOUDSNIP_USERS_TABLE_NAME,
                Item: {
                    userId: userId,
                    email: email,
                    username: email,
                    createdAt: new Date().toISOString(),
                    avatarUrl: null
                }
            }).promise();
        } catch (dynamoError) {

            return {
                statusCode: 500,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
                body: JSON.stringify({ 
                    message: "Error saving user data",
                }),
            };
        }

        return {
            statusCode: 201,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ message: "Signup successful! Please confirm your account via email." }),
        };

    } catch (error) {

        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ message: "Internal Server Error" }),
        };
    }
};
