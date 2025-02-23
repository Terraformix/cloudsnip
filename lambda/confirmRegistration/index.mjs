import AWS from 'aws-sdk';
import config from './config/index.js';

const cognito = new AWS.CognitoIdentityServiceProvider();

export const handler = async (event) => {
    try {
        const requestBody = JSON.parse(event.body);
        const { username, confirmationCode } = requestBody;


        if (!username || !confirmationCode) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
                body: JSON.stringify({ error: "Username and confirmation code are required" }),
            };
        }

        const params = {
            ClientId: config.COGNITO_CLIENT_ID,
            Username: username,
            ConfirmationCode: confirmationCode,
        };

        const data = await cognito.confirmSignUp(params).promise();

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ message: "User confirmed successfully", data }),
        };

    } catch (err) {
        console.error("Cognito Error:", err);

        return {
            statusCode: 400,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ error: err.message || "An error occurred" }),
        };
    }
};
