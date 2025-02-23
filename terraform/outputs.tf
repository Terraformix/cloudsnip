output "api_gateway_url" {
  value = aws_api_gateway_deployment.cloudsnip_api_deployment.invoke_url
}