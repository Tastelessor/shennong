# ---- API Gateway (HTTP API) ----
# 替代 ALB，做同样的事：接收请求、转发给后端
# 区别：API Gateway 前 12 个月每月 100 万次调用免费，ALB 约 $16/月
#
# 部署流程（两阶段）：
#   阶段 1: terraform apply                          → 创建所有资源，ECS 启动，拿到容器 IP
#   阶段 2: terraform apply -var="backend_endpoint=X.X.X.X" → 更新 API Gateway 指向真实 IP
#
# 容器重启后 IP 会变，需要重新获取 IP 并 apply

# HTTP API（比 REST API 便宜、快、简单）
resource "aws_apigatewayv2_api" "main" {
  name          = "${var.project_name}-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization"]
    max_age       = 300
  }

  tags = { Name = "${var.project_name}-api" }
}

# 集成：API Gateway → 后端 ECS 容器
# integration_uri = 后端地址（IP:端口）
# 对于 HTTP_PROXY 模式，请求路径原样转发
# 例：用户请求 /api/clinic-locations → 转发到 http://X.X.X.X:3000/api/clinic-locations
resource "aws_apigatewayv2_integration" "backend" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "HTTP_PROXY"
  integration_uri    = "http://${var.backend_endpoint}:${var.backend_port}"
  integration_method = "ANY"

  # 不改写请求路径，原样转发
  request_parameters = {}
}

# 路由：所有请求 → 转发到后端集成
# $default = 匹配所有路径和方法
resource "aws_apigatewayv2_route" "default" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.backend.id}"
}

# 部署阶段（production）
resource "aws_apigatewayv2_stage" "production" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true

  tags = { Name = "${var.project_name}-prod-stage" }
}

# 输出 API Gateway 的域名
# CloudFront 的 /api/* 行为会指向这个域名
output "api_gateway_endpoint" {
  description = "API Gateway endpoint URL"
  value       = aws_apigatewayv2_api.main.api_endpoint
}
