#!/bin/bash
# 蛋糕商城 - 阿里云ECS部署脚本
set -e

echo "========================================="
echo "  蛋糕商城 - ECS部署脚本"
echo "========================================="

# 生成随机JWT密钥
JWT_SECRET=$(openssl rand -base64 48)
echo "已生成JWT密钥"

# 创建.env文件
cat > .env << EOF
# 数据库配置
DB_HOST=db
DB_PORT=3306
DB_USER=cake_mall_user
DB_PASSWORD=$(openssl rand -base64 16)
DB_NAME=cake_mall
DB_ROOT_PASSWORD=$(openssl rand -base64 24)

# JWT密钥
JWT_SECRET=${JWT_SECRET}

# 前端地址（改为你的域名或IP）
FRONTEND_URL=http://your-server-ip

# 管理员初始密码
ADMIN_EMAIL=admin@cake-mall.com
ADMIN_PASSWORD=$(openssl rand -base64 12)

# 端口
PORT=3000
NODE_ENV=production
EOF

echo ".env文件已创建"
echo ""
echo "管理员账号: admin@cake-mall.com"
grep "ADMIN_PASSWORD" .env | cut -d= -f2 | xargs echo "管理员密码:"
echo ""
echo "请立即登录后台修改密码！"
echo ""
echo "========================================="
echo "  开始构建Docker镜像"
echo "========================================="

# 构建并启动
docker-compose up -d --build

echo ""
echo "========================================="
echo "  部署完成！"
echo "  前端: http://your-server-ip"
echo "  管理后台: http://your-server-ip/admin/login"
echo "========================================="
