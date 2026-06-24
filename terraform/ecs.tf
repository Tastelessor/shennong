# ---- ECS (Elastic Container Service) ----
# Fargate: 不管机器，只管容器

# ECS 集群
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"                # CloudWatch 容器级监控
  }

  tags = { Name = "${var.project_name}-cluster" }
}

# IAM Role：ECS 任务执行角色（拉镜像、写日志）
resource "aws_iam_role" "ecs_task_execution" {
  name = "${var.project_name}-ecs-exec-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# IAM Role：ECS 任务角色（容器运行时的权限，比如访问 S3）
resource "aws_iam_role" "ecs_task" {
  name = "${var.project_name}-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })
}

# Task Definition — 容器的"配方"
resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project_name}-backend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"           # Fargate 必须用 awsvpc
  cpu                      = var.backend_cpu
  memory                   = var.backend_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  # EFS 挂载
  volume {
    name = "app-data"
    efs_volume_configuration {
      file_system_id     = aws_efs_file_system.main.id
      transit_encryption = "ENABLED"
      authorization_config {
        access_point_id = aws_efs_access_point.app.id
        iam             = "ENABLED"
      }
    }
  }

  container_definitions = jsonencode([{
    name      = "backend"
    image     = var.backend_image
    essential = true

    portMappings = [{
      containerPort = var.backend_port
      protocol      = "tcp"
    }]

    environment = [
      { name = "DB_PATH",     value = "/data/db/shennong.db" },
      { name = "UPLOAD_DIR",  value = "/data/uploads" },
      { name = "PORT",        value = tostring(var.backend_port) }
    ]

    mountPoints = [{
      sourceVolume  = "app-data"
      containerPath = "/data"
      readOnly      = false
    }]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/${var.project_name}"
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "backend"
      }
    }
  }])

  tags = { Name = "${var.project_name}-backend-task" }
}

# CloudWatch 日志组
resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${var.project_name}"
  retention_in_days = 7               # 免费额度内，保留7天

  tags = { Name = "${var.project_name}-logs" }
}

# ECS Service — 保持容器一直跑
resource "aws_ecs_service" "backend" {
  name            = "${var.project_name}-backend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 1                  # 只跑1个实例（省钱）
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.public[*].id   # 暂用公网子网（省 NAT Gateway 钱）
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = true                       # 需要公网IP拉镜像
  }

  tags = { Name = "${var.project_name}-backend-svc" }
}
