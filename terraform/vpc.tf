# ---- VPC ----
# 为什么要自己建VPC？面试时你要能解释：
# "用默认VPC能跑，但生产环境应该隔离网络，
#  控制哪些资源暴露在公网，哪些在私网。"

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

# 公网子网（ALB放这里，接收用户请求）
resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-${count.index + 1}"
  }
}

# 私网子网（ECS容器和EFS放这里，不直接暴露公网）
resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "${var.project_name}-private-${count.index + 1}"
  }
}

# Internet Gateway — 公网子网的出口
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "${var.project_name}-igw" }
}

# 公网路由表：所有流量走 Internet Gateway
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = { Name = "${var.project_name}-public-rt" }
}

resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# NAT Gateway — 私网子网访问外网的出口（ECS拉镜像需要）
# 注意：NAT Gateway 不在免费额度内，约 $0.045/小时 ≈ $32/月
# 为了省钱，先用 public subnet 跑 ECS，后面再考虑私网隔离
# resource "aws_nat_gateway" "main" { ... }
# resource "aws_route_table" "private" { ... }
