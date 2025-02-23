###########################################
# Authentication & Authorization Resources
###########################################

# Cognito User Pool Configuration
resource "aws_cognito_user_pool" "user_pool" {
  name = "cloudsnip-user-pool"

  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  username_attributes = ["email"]
  auto_verified_attributes = ["email"]

  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  verification_message_template {
    email_message = "Your verification code is {####}."
    email_subject = "Your CloudSnip Verification Code"
  }

  password_policy {
    minimum_length                   = 6
    require_lowercase                = true
    require_uppercase                = true
    require_numbers                  = false
    require_symbols                  = true
    temporary_password_validity_days = 7
  }
}

# Cognito User Pool Client
resource "aws_cognito_user_pool_client" "user_pool_client" {
  name = "CloudSnipApp"
  user_pool_id = aws_cognito_user_pool.user_pool.id
  generate_secret = false
  explicit_auth_flows = ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
}

###########################################
# Storage Resources
###########################################

# Main DynamoDB Table for CloudSnips
resource "aws_dynamodb_table" "cloudsnips" {
  name         = "CloudSnips"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"
  range_key    = "shortCode"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "shortCode"
    type = "S"
  }

  # Global Secondary Index for shortCode lookups
  global_secondary_index {
    name               = "shortCodeIndex"
    hash_key           = "shortCode"
    projection_type    = "ALL"
  }
}

# DynamoDB Table for Event Tracking
resource "aws_dynamodb_table" "cloudsnip_events" {
  name         = "CloudSnipEvents"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"
  range_key    = "eventId"

  attribute {
    name = "userId"
    type = "S"
  }
  attribute {
    name = "eventId"
    type = "S"
  }
}

# DynamoDB Table for User Profiles
resource "aws_dynamodb_table" "cloudsnip_users" {
  name         = "CloudSnipUsers"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"

  attribute {
    name = "userId"
    type = "S"
  }
}

###########################################
# S3 Configuration
###########################################

# S3 Bucket for User Avatars
resource "aws_s3_bucket" "cloudsnip" {
  bucket = "cloudsnip-bucket"
  force_destroy = true
}

# S3 Bucket Ownership Controls
resource "aws_s3_bucket_ownership_controls" "example" {
  bucket = aws_s3_bucket.cloudsnip.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

# S3 Public Access Configuration
resource "aws_s3_bucket_public_access_block" "example" {
  bucket = aws_s3_bucket.cloudsnip.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# S3 Bucket ACL
resource "aws_s3_bucket_acl" "example" {
  depends_on = [
    aws_s3_bucket_ownership_controls.example,
    aws_s3_bucket_public_access_block.example,
  ]

  bucket = aws_s3_bucket.cloudsnip.id
  acl    = "public-read"
}

# S3 Bucket Policy for Public Read Access
resource "aws_s3_bucket_policy" "public_bucket_policy" {
  bucket = aws_s3_bucket.cloudsnip.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "PublicReadGetObject",
        Effect    = "Allow",
        Principal = "*",
        Action    = "s3:GetObject",
        Resource  = "arn:aws:s3:::${aws_s3_bucket.cloudsnip.id}/*"
      }
    ]
  })
}

###########################################
# Messaging & Notification Resources
###########################################

# SQS Queue
resource "aws_sqs_queue" "cloudsnip" {
  name = "cloudsnip-queue"
}

# SNS Topic for Notifications
resource "aws_sns_topic" "cloudsnip_notifications" {
  name         = "cloudsnipNotifications"
  display_name = "CloudSnip Notifications"
}

# SNS Topic Subscription
resource "aws_sns_topic_subscription" "cloudsnip_email_subscription" {
  topic_arn = aws_sns_topic.cloudsnip_notifications.arn
  protocol  = "email"
  endpoint  = "youremail@gmail.com"
}

###########################################
# Lambda Configuration
###########################################

# Lambda Layer for Shared Dependencies
resource "aws_lambda_layer_version" "cloudsnip_layer" {
  filename    = "./zipped-lambdas/cloudSnipLayer.zip"
  layer_name  = "cloudSnipLayer"
  description = "Lambda Layer for shared dependencies"
}

# Lambda Event Source Mapping for SQS
resource "aws_lambda_event_source_mapping" "sqs_trigger" {
  event_source_arn = aws_sqs_queue.cloudsnip.arn
  function_name    = aws_lambda_function.cloudsnip_validation_processor.arn
  enabled          = true
}

###########################################
# IAM Roles and Policies
###########################################

# Main Lambda IAM Role
resource "aws_iam_role" "lambda_role" {
  name = "cloudsnip-lambda"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

# Consolidated Lambda IAM Policy
resource "aws_iam_policy" "consolidated_lambda_policy" {
  name        = "cloudsnip-lambda-policy"
  description = "Consolidated IAM policy for Lambda functions"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:*"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:SendMessage",
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = aws_sqs_queue.cloudsnip.arn
      },
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:PutObjectAcl",
          "s3:GetObject",
          "s3:DeleteObject"
        ]
        Resource = "arn:aws:s3:::${aws_s3_bucket.cloudsnip.bucket}/*"
      },
      {
        Effect = "Allow"
        Action = "sns:Publish"
        Resource = aws_sns_topic.cloudsnip_notifications.arn
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# Single policy attachment
resource "aws_iam_role_policy_attachment" "lambda_policy_attachment" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.consolidated_lambda_policy.arn
}