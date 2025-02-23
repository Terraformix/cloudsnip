variable "aws_region" {
  description = "The AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "dynamodb_links_table_name" {
  description = "DynamoDB table name for short links"
  type        = string
  default     = "short-links"
}

variable "dynamodb_event_table_name" {
  description = "DynamoDB table name for event tracking"
  type        = string
  default     = "url-events"
}

variable "sqs_queue_name" {
  description = "SQS queue for processing events"
  type        = string
  default     = "url-events-queue"
}

variable "cognito_user_pool_name" {
  description = "Cognito user pool name"
  type        = string
  default     = "url-shortener-user-pool"
}

variable "cognito_client_name" {
  description = "Cognito user pool client name"
  type        = string
  default     = "url-shortener-client"
}

variable "lambda_function_name" {
  description = "Name of the Lambda function"
  type        = string
  default     = "url-shortener"
}

variable "api_gateway_name" {
  description = "Name of the API Gateway"
  type        = string
  default     = "url-shortener-api"
}
