resource "aws_lambda_function" "register" {
  function_name = "register"
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.handler"
  runtime       = "nodejs22.x"
  timeout       = 10

  layers = [
    aws_lambda_layer_version.cloudsnip_layer.arn
  ]

  filename         = "./zipped-lambdas/register.zip" 
  source_code_hash = filebase64sha256("./zipped-lambdas/register.zip")

  environment {
    variables = {
      DYNAMODB_CLOUDSNIPS_TABLE_NAME = aws_dynamodb_table.cloudsnips.name
      DYNAMODB_CLOUDSNIPS_USERS_TABLE_NAME = aws_dynamodb_table.cloudsnip_users.name
      DYNAMODB_CLOUDSNIPS_EVENT_TABLE_NAME = aws_dynamodb_table.cloudsnip_events.name
      CLOUDSNIP_QUEUE_URL       = aws_sqs_queue.cloudsnip.url
      USER_POOL_ID              = aws_cognito_user_pool.user_pool.id
      COGNITO_CLIENT_ID = aws_cognito_user_pool_client.user_pool_client.id
      COGNITO_CLIENT_SECRET = aws_cognito_user_pool_client.user_pool_client.client_secret
    }
  }
}