# ---- Security Groups ----
# 安全组 = 虚拟防火墙，控制入站/出站流量

# ECS 安全组：允许 API Gateway 访问后端端口
# API Gateway 的出口 IP 不固定，所以用 0.0.0.0/0
# 生产环境应该用 AWS IP 范围列表 + 自动更新
resource "aws_security_group" "ecs" {
  name        = "${var.project_name}-ecs-sg"
  description = "Allow API Gateway traffic to backend"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = var.backend_port
    to_port     = var.backend_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-ecs-sg" }
}

# EFS 安全组：只允许 ECS 容器访问
resource "aws_security_group" "efs" {
  name        = "${var.project_name}-efs-sg"
  description = "Allow NFS from ECS tasks"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 2049
    to_port         = 2049
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-efs-sg" }
}
