variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"
}

variable "project_name" {
  description = "Project name, used as prefix for all resources"
  type        = string
  default     = "shennong"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

# 后端容器配置
variable "backend_cpu" {
  description = "Fargate task CPU units (256 = 0.25 vCPU)"
  type        = number
  default     = 256
}

variable "backend_memory" {
  description = "Fargate task memory in MB"
  type        = number
  default     = 512
}

variable "backend_port" {
  description = "Backend container port"
  type        = number
  default     = 3000
}

variable "backend_image" {
  description = "Docker image URI for backend"
  type        = string
  # 部署时通过 terraform apply -var 或 terraform.tfvars 传入
}

variable "backend_endpoint" {
  description = "Backend container public IP (set after first deploy)"
  type        = string
  default     = "0.0.0.0"
}
