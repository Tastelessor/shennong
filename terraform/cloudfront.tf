# ---- CloudFront (CDN) ----
# 前端静态资源的全球分发

# Origin Access Control — CloudFront 访问 S3 的凭证
resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "${var.project_name}-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"  # 最便宜：北美+欧洲+亚洲

  # S3 源
  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = "S3Frontend"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  # API Gateway 源（API 请求转发到这里）
  origin {
    # API Gateway 的域名格式：api-id.execute-api.region.amazonaws.com
    domain_name = replace(aws_apigatewayv2_api.main.api_endpoint, "https://", "")
    origin_id   = "APIGateway"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"   # API Gateway 只支持 HTTPS
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # 默认行为：静态资源走 S3
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3Frontend"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 86400    # 缓存1天
    max_ttl     = 31536000 # 最长1年
  }

  # /api/* 请求转发到 API Gateway
  ordered_cache_behavior {
    path_pattern           = "/api/*"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "APIGateway"
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = true
      headers      = ["Host", "Origin", "Authorization"]
      cookies {
        forward = "all"
      }
    }

    min_ttl     = 0
    default_ttl = 0   # API 不缓存
    max_ttl     = 0
  }

  # SPA 路由：所有 403/404 返回 index.html（React Router 处理）
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true  # 用 CloudFront 默认域名（免费）
  }

  tags = { Name = "${var.project_name}-cdn" }
}
