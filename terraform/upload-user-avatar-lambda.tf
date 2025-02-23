resource "aws_lambda_function" "upload_user_avatar" {
  function_name = "uploadUserAvatar"
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.handler"
  runtime       = "nodejs22.x"
  timeout       = 10

  layers = [
    aws_lambda_layer_version.cloudsnip_layer.arn
  ]

  filename         = "./zipped-lambdas/uploadUserAvatar.zip"
  source_code_hash = filebase64sha256("./zipped-lambdas/uploadUserAvatar.zip")

  environment {
    variables = {
      DYNAMODB_CLOUDSNIPS_TABLE_NAME = aws_dynamodb_table.cloudsnips.name
      DYNAMODB_CLOUDSNIPS_EVENT_TABLE_NAME = aws_dynamodb_table.cloudsnip_events.name
      CLOUDSNIP_QUEUE_URL       = aws_sqs_queue.cloudsnip.url
      USER_POOL_ID              = aws_cognito_user_pool.user_pool.id
      COGNITO_CLIENT_ID = aws_cognito_user_pool_client.user_pool_client.id
      COGNITO_CLIENT_SECRET = aws_cognito_user_pool_client.user_pool_client.client_secret
      CLOUDSNIP_S3_URL = "https://${aws_s3_bucket.cloudsnip.id}.s3.${aws_s3_bucket.cloudsnip.region}.amazonaws.com"
      CLOUDSNIP_S3_BUCKET_NAME = aws_s3_bucket.cloudsnip.id
    }
  }
}