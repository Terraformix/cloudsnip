resource "aws_lambda_function" "generate_cloudsnip" {
  function_name = "generateCloudsnip"
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.handler"
  runtime       = "nodejs22.x"
  timeout       = 10

  layers = [
    aws_lambda_layer_version.cloudsnip_layer.arn
  ]

  filename         = "./zipped-lambdas/generateCloudsnip.zip"
  source_code_hash = filebase64sha256("./zipped-lambdas/generateCloudsnip.zip")

  environment {
    variables = {
      DYNAMODB_CLOUDSNIPS_TABLE_NAME = aws_dynamodb_table.cloudsnips.name
      DYNAMODB_CLOUDSNIPS_EVENT_TABLE_NAME = aws_dynamodb_table.cloudsnip_events.name
      CLOUDSNIP_QUEUE_URL       = aws_sqs_queue.cloudsnip.url
      USER_POOL_ID              = aws_cognito_user_pool.user_pool.id
      COGNITO_CLIENT_ID = aws_cognito_user_pool_client.user_pool_client.id
      COGNITO_CLIENT_SECRET = aws_cognito_user_pool_client.user_pool_client.client_secret
      CLOUDSNIP_SNS_ARN = aws_sns_topic.cloudsnip_notifications.arn

    }
  }
}