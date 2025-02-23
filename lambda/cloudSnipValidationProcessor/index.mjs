import AWS from 'aws-sdk';
import config from './config/index.js';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const BAD_URLS = [
    "http://malicious-site.com",
    "https://phishing-example.net",
    "http://scam-site.org",
    "https://badactor.com",
    "http://fake-bank-login.com",
    "https://stealyourdata.net",
    "http://fraudulent-site.org",
    "https://trojan-download.com",
    "http://identity-theft.xyz",
    "https://ransomware-trap.io",
    "http://clickjacking-site.co",
    "https://virus-injection.com",
    "http://fake-antivirus-alert.net",
    "https://socialmedia-hijack.com",
    "http://lottery-scam.info",
    "https://fake-charity-donation.org",
    "http://card-skimming-shop.net",
    "https://ads-malware-infected.com",
    "http://suspicious-free-downloads.xyz",
    "https://unauthorized-payment.site",
    "http://credential-harvesting.com",
    "https://deceptive-billing.net",
    "http://bitcoin-doubling-scam.org",
    "https://support-scam-phonecall.com",
    "http://blackmarket-fakegoods.net"
];


async function processCloudSnip(message) {

    const validationResult = await validateCloudSnip(message.originalUrl);

    await dynamoDB.update({
        TableName: config.DYNAMODB_CLOUDSNIPS_TABLE_NAME,
        Key: {
            userId: message.userId,
            shortCode: message.shortCode
        },
        UpdateExpression: 'SET isValid = :status',
        ExpressionAttributeValues: {
            ':status': validationResult.isValid
        }
    }).promise();
}

async function validateCloudSnip(url) {

    try {
        new URL(url);
    } catch (err) {
        return { isValid: false, message: "Invalid URL format" };
    }

    if (BAD_URLS.includes(url.toLowerCase())) {
        return { isValid: false, message: "URL is flagged as malicious" };
    }

    return { isValid: true, message: "URL is safe" };
}

export const handler = async (event) => {

    for (const record of event.Records) {
        try {
            const message = JSON.parse(record.body);

            switch (message.action) {
                case 'CLOUDSNIP_CREATED':
                    await processCloudSnip(message);
                    break;
                default:
                    console.log("Invalid action received:", message.action);
            }
        } catch (error) {
            console.error("Error processing message:", error);
        }
    }
};