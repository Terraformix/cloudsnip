import AWS from 'aws-sdk';
import config from './config/index.js';

const cognito = new AWS.CognitoIdentityServiceProvider();

export const handler = async (event) => {
    try {
        const requestBody = JSON.parse(event.body || "{}");
        const { username, password } = requestBody;

        if (!username || !password) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
                body: JSON.stringify({ message: "Username and password are required" }),
            };
        }

        const params = {
            AuthFlow: "USER_PASSWORD_AUTH",
            ClientId: config.COGNITO_CLIENT_ID,
            AuthParameters: {
                USERNAME: username,
                PASSWORD: password,
            },
        };

        const response = await cognito.initiateAuth(params).promise();

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({
                message: "Sign-in successful",
                tokens: response.AuthenticationResult || {},
            }),
        };
    } catch (error) {
        console.error("Error signing in:", error);
        return {
            statusCode: 400,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ message: "Sign-in failed", error: error.message }),
        };
    }
};
