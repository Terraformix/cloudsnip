import dotenv from "dotenv";
dotenv.config();

const config = {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION || "us-east-1",
    DYNAMODB_CLOUDSNIP_USERS_TABLE_NAME: process.env.DYNAMODB_CLOUDSNIP_USERS_TABLE_NAME || "CloudSnipUsers",
    DYNAMODB_CLOUDSNIPS_TABLE_NAME: process.env.DYNAMODB_CLOUDSNIPS_TABLE_NAME || "CloudSnips",
    DYNAMODB_CLOUDSNIPS_EVENT_TABLE_NAME: process.env.DYNAMODB_CLOUDSNIPS_EVENT_TABLE_NAME || "CloudSnipEvents",
    CLOUDSNIP_QUEUE_URL: process.env.CLOUDSNIP_QUEUE_URL,
    PORT: process.env.PORT,
    COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID,
    COGNITO_CLIENT_SECRET: process.env.COGNITO_CLIENT_SECRET
};

export default config;
