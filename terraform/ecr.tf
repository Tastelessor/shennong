# ---- ECR (Elastic Container Registry) ----
# Docker 镜像仓库，类似 Docker Hub，但是在你的 AWS 账号里

resource "aws_ecr_repository" "backend" {
  name                 = var.project_name
  image_tag_mutability = "MUTABLE"        # 允许覆盖同名 tag（开发方便）
  force_delete         = true             # terraform destroy 时连镜像一起删

  image_scanning_configuration {
    scan_on_push = true                    # 推送时自动扫描漏洞
  }

  tags = { Name = "${var.project_name}-ecr" }
}

# 生命周期策略：自动清理旧镜像，省钱
resource "aws_ecr_lifecycle_policy" "backend" {
  repository = aws_ecr_repository.backend.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = {
        type = "expire"
      }
    }]
  })
}
