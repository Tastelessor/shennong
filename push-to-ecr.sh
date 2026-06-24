#!/bin/bash
# push-to-ecr.sh -- 用 skopeo 推镜像到 ECR，绕过 Docker daemon 的代理问题
# 用法: ./push-to-ecr.sh

set -e

REPO="704807605771.dkr.ecr.ap-northeast-1.amazonaws.com/shennong"
REGION="ap-northeast-1"
PROFILE="nico-deploy"
PROXY="socks5://192.168.5.79:10808"
MAX_RETRIES=10

echo "=== Pushing shennong to ECR ==="

# Get ECR password
PASSWORD=$(aws ecr get-login-password --region "$REGION" --profile "$PROFILE")

# Export Docker image to tarball
echo "[1/3] Exporting image..."
docker save shennong:latest -o /tmp/shennong-push.tar

# Push with retries
echo "[2/3] Pushing to ECR (max $MAX_RETRIES retries)..."
for i in $(seq 1 $MAX_RETRIES); do
    echo "  Attempt $i/$MAX_RETRIES..."
    if HTTPS_PROXY="$PROXY" HTTP_PROXY="$PROXY" skopeo copy         docker-archive:/tmp/shennong-push.tar         "docker://$REPO:latest"         --dest-creds "AWS:$PASSWORD"         2>&1; then
        echo "[3/3] Success!"
        rm -f /tmp/shennong-push.tar
        exit 0
    fi
    echo "  Failed, retrying in 3s..."
    sleep 3
done

echo "ERROR: Failed after $MAX_RETRIES attempts"
rm -f /tmp/shennong-push.tar
exit 1
