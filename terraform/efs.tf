# ---- EFS (Elastic File System) ----
# 给 SQLite 数据库和上传文件提供持久化存储
# ECS 容器重启/替换时数据不丢

resource "aws_efs_file_system" "main" {
  creation_token = "${var.project_name}-efs"
  encrypted      = true

  # 性能模式：generalPurpose 足够（另一个是 maxIO，贵一倍）
  performance_mode = "generalPurpose"

  # 吞吐模式：bursting（按文件系统大小自动积累信用）
  # 另一个 provisioned 要额外付费
  throughput_mode = "bursting"

  tags = { Name = "${var.project_name}-efs" }
}

# 挂载目标：每个子网一个（ECS 在哪个子网跑，EFS 就要有对应的挂载点）
resource "aws_efs_mount_target" "public" {
  count           = 2
  file_system_id  = aws_efs_file_system.main.id
  subnet_id       = aws_subnet.public[count.index].id
  security_groups = [aws_security_group.efs.id]
}

# 访问点：给 ECS 用的"入口"，指定 UID/GID 和路径
resource "aws_efs_access_point" "app" {
  file_system_id = aws_efs_file_system.main.id

  posix_user {
    uid = 1000
    gid = 1000
  }

  root_directory {
    path = "/shennong"
    creation_info {
      owner_uid   = 1000
      owner_gid   = 1000
      permissions = "755"
    }
  }

  tags = { Name = "${var.project_name}-app-ap" }
}
