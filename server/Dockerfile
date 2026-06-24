# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# sqlite3 需要编译原生模块
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci --production

# ---- Runtime stage ----
FROM node:20-alpine

WORKDIR /app

# 运行时不需要编译工具，保持镜像最小
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# EFS 挂载点
ENV DB_PATH=/data/db/shennong.db
ENV UPLOAD_DIR=/data/uploads
RUN mkdir -p /data/uploads /data/db

EXPOSE 3000

CMD ["node", "index.js"]
