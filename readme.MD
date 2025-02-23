# CloudSnip - Serverless URL Shortener & Management App

CloudSnip is a fully serverless URL shortening and management application built with modern web technologies and deployed on AWS. It leverages multiple AWS services for scalability, security, and efficiency while using Terraform for infrastructure automation.

## 🚀 Tech Stack
- **Node.js** - Backend Lambda functions
- **Vue.js** - Interactive frontend
- **HTML/CSS** - UI design

## ☁️ AWS Services

### AWS Lambda ⚡
- Serverless functions handling core functionalities
- Custom handlers for URL shortening, user management, and avatar uploads
- Lambda Layers to optimize dependencies

### Amazon API Gateway 🌐
- Acts as the entry point for backend Lambda functions
- Custom authorizers using Cognito for authentication

### Amazon Cognito 🔐
- Secure user authentication & JWT token management
- Streamlined user registration & login flow

### Amazon DynamoDB 📊
- NoSQL database for fast and scalable data storage
- Global Secondary Indexes (GSIs) for optimized querying

### Amazon S3 🗄️
- Object storage for user avatars and profile pictures

### Amazon SQS 📩
- Asynchronous processing for URL validation
- Lambda functions process messages from the queue before URL redirection

### Amazon SNS 📢
- Real-time email notifications to admins for user interactions

## 🔒 Security & IAM Best Practices
- **Principle of Least Privilege** - Custom IAM roles for enhanced security
- **Granular permission policies** - Controlled access to AWS resources

## 🏗️ Terraform - Infrastructure as Code (IaC)
- Fully automated AWS deployment
- Quick infrastructure setup and teardown

## ✨ Key Features
- 🔗 Custom URL shortening
- 👤 User profile management with avatars
- 📊 Real-time URL status tracking
- 🛡️ Malicious URL detection before redirection
- 📩 Email notifications for new URLs
- 🔐 Secure user authentication

## 🎯 Learning Outcomes
- **Serverless Architecture** - Leveraging AWS Lambda for scalable backend
- **AWS Cloud Services** - Practical experience with multiple AWS offerings
- **IAM Security Best Practices** - Implementing least-privilege access
- **Distributed System Design** - Using SQS for asynchronous processing
- **Infrastructure as Code** - Automating cloud deployments with Terraform

