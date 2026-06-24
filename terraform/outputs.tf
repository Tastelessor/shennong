output "cloudfront_domain" {
  description = "CloudFront domain — 前端访问地址"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "ecr_repository_url" {
  description = "ECR repository URL — 推送镜像到这里"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "ECS service name"
  value       = aws_ecs_service.backend.name
}

output "frontend_s3_bucket" {
  description = "S3 bucket for frontend static files"
  value       = aws_s3_bucket.frontend.bucket
}

output "efs_id" {
  description = "EFS file system ID"
  value       = aws_efs_file_system.main.id
}
