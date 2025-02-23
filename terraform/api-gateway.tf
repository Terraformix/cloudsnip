# Create API Gateway
resource "aws_api_gateway_rest_api" "cloudsnip_api" {
  name          = "CloudSnipApi"
  description = "API Gateway for CloudSnip"
  

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}


resource "aws_api_gateway_stage" "dev" {
  stage_name = "dev"
  rest_api_id = aws_api_gateway_rest_api.cloudsnip_api.id
  deployment_id = aws_api_gateway_deployment.cloudsnip_api_deployment.id
}

# Create API Gateway Authorizer
resource "aws_api_gateway_authorizer" "cognito_authorizer" {
  name          = "CloudSnipCognitoAuthorizer"
  rest_api_id   = aws_api_gateway_rest_api.cloudsnip_api.id
  type          = "COGNITO_USER_POOLS"
  provider_arns = [aws_cognito_user_pool.user_pool.arn]
}

// Resources
resource "aws_api_gateway_resource" "api" {
  rest_api_id = aws_api_gateway_rest_api.cloudsnip_api.id
  parent_id   = aws_api_gateway_rest_api.cloudsnip_api.root_resource_id
  path_part   = "api"
}

resource "aws_api_gateway_resource" "auth" {
  rest_api_id = aws_api_gateway_rest_api.cloudsnip_api.id
  parent_id   = aws_api_gateway_resource.api.id
  path_part   = "auth"
}


resource "aws_api_gateway_resource" "register" {
  rest_api_id = aws_api_gateway_rest_api.cloudsnip_api.id
  parent_id   = aws_api_gateway_resource.auth.id
  path_part   = "register"
}

resource "aws_api_gateway_resource" "login" {
  rest_api_id = aws_api_gateway_rest_api.cloudsnip_api.id
  parent_id   = aws_api_gateway_resource.auth.id
  path_part   = "login"
}

resource "aws_api_gateway_resource" "confirm_registration" {
  rest_api_id = aws_api_gateway_rest_api.cloudsnip_api.id
  parent_id   = aws_api_gateway_resource.auth.id
  path_part   = "confirm-registration"
}

resource "aws_api_gateway_resource" "cloudsnips" {
  rest_api_id = aws_api_gateway_rest_api.cloudsnip_api.id
  parent_id   = aws_api_gateway_resource.api.id
  path_part   = "cloudsnips"
}

resource "aws_api_gateway_resource" "cloudsnip" {
  rest_api_id = aws_api_gateway_rest_api.cloudsnip_api.id
  parent_id   = aws_api_gateway_resource.cloudsnips.id
  path_part   = "{shortCode}"
}

resource "aws_api_gateway_resource" "update_cloudsnip_status" {
  rest_api_id = aws_api_gateway_rest_api.cloudsnip_api.id
  parent_id   = aws_api_gateway_resource.cloudsnip.id
  path_part   = "status"
}

resource "aws_api_gateway_resource" "generate" {
  rest_api_id = aws_api_gateway_rest_api.cloudsnip_api.id
  parent_id   = aws_api_gateway_resource.cloudsnips.id
  path_part   = "generate"
}

resource "aws_api_gateway_resource" "user" {
  rest_api_id = aws_api_gateway_rest_api.cloudsnip_api.id
  parent_id   = aws_api_gateway_resource.api.id
  path_part   = "user"
}

resource "aws_api_gateway_resource" "user_details" {
  rest_api_id = aws_api_gateway_rest_api.cloudsnip_api.id
  parent_id   = aws_api_gateway_resource.user.id
  path_part   = "details"
}

resource "aws_api_gateway_resource" "upload_user_avatar" {
  rest_api_id = aws_api_gateway_rest_api.cloudsnip_api.id
  parent_id   = aws_api_gateway_resource.user.id
  path_part   = "upload-avatar"
}



// Register
resource "aws_api_gateway_method" "register_post" {
  rest_api_id   = aws_api_gateway_rest_api.cloudsnip_api.id
  resource_id   = aws_api_gateway_resource.register.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "register_integration" {
  rest_api_id             = aws_api_gateway_rest_api.cloudsnip_api.id
  resource_id             = aws_api_gateway_resource.register.id
  http_method             = aws_api_gateway_method.register_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.register.invoke_arn
}

resource "aws_lambda_permission" "register_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.register.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.cloudsnip_api.execution_arn}/*/*"
}



// LOGIN
resource "aws_api_gateway_method" "login_post" {
  rest_api_id   = aws_api_gateway_rest_api.cloudsnip_api.id
  resource_id   = aws_api_gateway_resource.login.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "login_integration" {
  rest_api_id             = aws_api_gateway_rest_api.cloudsnip_api.id
  resource_id             = aws_api_gateway_resource.login.id
  http_method             = aws_api_gateway_method.login_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.login.invoke_arn
}

resource "aws_lambda_permission" "login_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.login.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.cloudsnip_api.execution_arn}/*/*"
}


// CONFIRM REGISTRATION
resource "aws_api_gateway_method" "confirm_registration_post" {
  rest_api_id   = aws_api_gateway_rest_api.cloudsnip_api.id
  resource_id   = aws_api_gateway_resource.confirm_registration.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "confirm_registration_integration" {
  rest_api_id             = aws_api_gateway_rest_api.cloudsnip_api.id
  resource_id             = aws_api_gateway_resource.confirm_registration.id
  http_method             = aws_api_gateway_method.login_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.confirm_registration.invoke_arn
}

resource "aws_lambda_permission" "confirm_registration_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.confirm_registration.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.cloudsnip_api.execution_arn}/*/*"
}

// Generate CloudSnip
resource "aws_api_gateway_method" "generate_cloudsnip_post" {
  rest_api_id   = aws_api_gateway_rest_api.cloudsnip_api.id
  resource_id   = aws_api_gateway_resource.generate.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito_authorizer.id
}

resource "aws_api_gateway_integration" "generate_cloudsnip_integration" {
  rest_api_id             = aws_api_gateway_rest_api.cloudsnip_api.id
  resource_id             = aws_api_gateway_resource.generate.id
  http_method             = aws_api_gateway_method.generate_cloudsnip_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.generate_cloudsnip.invoke_arn
}

resource "aws_lambda_permission" "generate_cloudsnip_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.generate_cloudsnip.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.cloudsnip_api.execution_arn}/*/*"
}


// Get All CloudSnips
resource "aws_api_gateway_method" "cloudsnips_get" {
  rest_api_id   = aws_api_gateway_rest_api.cloudsnip_api.id
  resource_id   = aws_api_gateway_resource.cloudsnips.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito_authorizer.id
}

resource "aws_api_gateway_integration" "get_all_cloudsnips_integration" {
  rest_api_id             = aws_api_gateway_rest_api.cloudsnip_api.id
  resource_id             = aws_api_gateway_resource.cloudsnips.id
  http_method             = aws_api_gateway_method.cloudsnips_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_all_cloudsnips.invoke_arn
  
}

resource "aws_lambda_permission" "get_all_cloudsnips_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_all_cloudsnips.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.cloudsnip_api.execution_arn}/*/*"
}

// Get CloudSnip
resource "aws_api_gateway_method" "cloudsnip_get" {
  rest_api_id   = aws_api_gateway_rest_api.cloudsnip_api.id
  resource_id   = aws_api_gateway_resource.cloudsnip.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito_authorizer.id
}

resource "aws_api_gateway_integration" "get_cloudsnip_integration" {
  rest_api_id             = aws_api_gateway_rest_api.cloudsnip_api.id
  resource_id             = aws_api_gateway_resource.cloudsnip.id
  http_method             = aws_api_gateway_method.cloudsnip_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_cloudsnip.invoke_arn
  
}

resource "aws_lambda_permission" "get_cloudsnip_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_cloudsnip.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.cloudsnip_api.execution_arn}/*/*"
}

// Delete CloudSnip
resource "aws_api_gateway_method" "cloudsnip_delete" {
  rest_api_id   = aws_api_gateway_rest_api.cloudsnip_api.id
  resource_id   = aws_api_gateway_resource.cloudsnip.id
  http_method   = "DELETE"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito_authorizer.id
}

resource "aws_api_gateway_integration" "delete_cloudsnip_integration" {
  rest_api_id             = aws_api_gateway_rest_api.cloudsnip_api.id
  resource_id             = aws_api_gateway_resource.cloudsnip.id
  http_method             = aws_api_gateway_method.cloudsnip_delete.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.delete_cloudsnip.invoke_arn
  
}

resource "aws_lambda_permission" "delete_cloudsnip_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.delete_cloudsnip.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.cloudsnip_api.execution_arn}/*/*"
}

// Update CloudSnip
resource "aws_api_gateway_method" "cloudsnip_update" {
  rest_api_id   = aws_api_gateway_rest_api.cloudsnip_api.id
  resource_id   = aws_api_gateway_resource.update_cloudsnip_status.id
  http_method   = "PATCH"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito_authorizer.id
}

resource "aws_api_gateway_integration" "update_cloudsnip_integration" {
  rest_api_id             = aws_api_gateway_rest_api.cloudsnip_api.id
  resource_id             = aws_api_gateway_resource.update_cloudsnip_status.id
  http_method             = aws_api_gateway_method.cloudsnip_update.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.update_cloudsnip_status.invoke_arn
  
}

resource "aws_lambda_permission" "update_cloudsnip_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.update_cloudsnip_status.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.cloudsnip_api.execution_arn}/*/*"
}

// Get User Details
resource "aws_api_gateway_method" "user_details_get" {
  rest_api_id   = aws_api_gateway_rest_api.cloudsnip_api.id
  resource_id   = aws_api_gateway_resource.user_details.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito_authorizer.id
}

resource "aws_api_gateway_integration" "get_user_details_integration" {
  rest_api_id             = aws_api_gateway_rest_api.cloudsnip_api.id
  resource_id             = aws_api_gateway_resource.user_details.id
  http_method             = aws_api_gateway_method.user_details_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_user_profile_details.invoke_arn
  
}

resource "aws_lambda_permission" "get_user_details_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_user_profile_details.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.cloudsnip_api.execution_arn}/*/*"
}

// Upload User Avatar
resource "aws_api_gateway_method" "user_avatar_upload_post" {
  rest_api_id   = aws_api_gateway_rest_api.cloudsnip_api.id
  resource_id   = aws_api_gateway_resource.upload_user_avatar.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito_authorizer.id
}

resource "aws_api_gateway_integration" "user_avatar_upload_integration" {
  rest_api_id             = aws_api_gateway_rest_api.cloudsnip_api.id
  resource_id             = aws_api_gateway_resource.upload_user_avatar.id
  http_method             = aws_api_gateway_method.user_avatar_upload_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.upload_user_avatar.invoke_arn
  
}

resource "aws_lambda_permission" "user_avatar_upload_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.upload_user_avatar.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.cloudsnip_api.execution_arn}/*/*"
}

resource "aws_api_gateway_method" "cors_options" {
  for_each = {
    register                 = aws_api_gateway_resource.register.id
    login                    = aws_api_gateway_resource.login.id
    confirm_registration     = aws_api_gateway_resource.confirm_registration.id
    generate                 = aws_api_gateway_resource.generate.id
    cloudsnips               = aws_api_gateway_resource.cloudsnips.id
    cloudsnip                = aws_api_gateway_resource.cloudsnip.id
    update_cloudsnip_status  = aws_api_gateway_resource.update_cloudsnip_status.id
    user                     = aws_api_gateway_resource.user.id
    user_details             = aws_api_gateway_resource.user_details.id
    upload_user_avatar       = aws_api_gateway_resource.upload_user_avatar.id
  }

  rest_api_id   = aws_api_gateway_rest_api.cloudsnip_api.id
  resource_id   = each.value
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "cors_options_response" {
  for_each = aws_api_gateway_method.cors_options

  rest_api_id = aws_api_gateway_rest_api.cloudsnip_api.id
  resource_id = each.value.resource_id
  http_method = each.value.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Headers" = true
  }
}

resource "aws_api_gateway_integration" "cors_options_integration" {
  for_each = aws_api_gateway_method.cors_options

  rest_api_id = aws_api_gateway_rest_api.cloudsnip_api.id
  resource_id = each.value.resource_id
  http_method = each.value.http_method
  type        = "MOCK"
  

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration_response" "cors_options_integration_response" {
  for_each = aws_api_gateway_method.cors_options

  rest_api_id = aws_api_gateway_rest_api.cloudsnip_api.id
  resource_id = each.value.resource_id
  http_method = each.value.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,GET,PUT,DELETE,PATCH,OPTIONS'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'"
  }

  response_templates = {
    "application/json" = ""
  }

    depends_on = [aws_api_gateway_integration.cors_options_integration]
}


resource "aws_api_gateway_deployment" "cloudsnip_api_deployment" {

  rest_api_id = aws_api_gateway_rest_api.cloudsnip_api.id

  depends_on = [
    aws_api_gateway_integration.generate_cloudsnip_integration,
    aws_api_gateway_integration.login_integration,
    aws_api_gateway_integration.register_integration,
    aws_api_gateway_integration.confirm_registration_integration,
    aws_api_gateway_integration.get_all_cloudsnips_integration,
    aws_api_gateway_integration.get_cloudsnip_integration,
    aws_api_gateway_integration.delete_cloudsnip_integration,
    aws_api_gateway_integration.update_cloudsnip_integration,
    aws_api_gateway_integration.get_user_details_integration
  ]
}