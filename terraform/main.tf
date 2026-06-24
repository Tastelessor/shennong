terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # State 存在 S3，多机协作安全
  backend "s3" {
    bucket         = "shennong-tf-state-704807605771"
    key            = "shennong/terraform.tfstate"
    region         = "ap-northeast-1"
    profile        = "nico-deploy"
    encrypt        = true
  }
}

provider "aws" {
  region  = var.aws_region
  profile = "nico-deploy"
}

# 你的AWS账号ID
data "aws_caller_identity" "current" {}

# 可用区列表
data "aws_availability_zones" "available" {
  state = "available"
}
