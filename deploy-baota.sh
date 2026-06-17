#!/bin/bash
# 蛋糕商城 - 宝塔面板一键部署脚本
set -e

APP_DIR="/www/wwwroot/cake-mall"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"

echo "========================================="
echo "  蛋糕商城 - 宝塔面板部署"
echo "========================================="

# 1. 安装Node依赖
echo "[1/5] 安装后端依赖..."
cd "$BACKEND_DIR"
npm install --production=false

echo "[2/5] 安装前端依赖..."
cd "$FRONTEND_DIR"
npm install

# 2. 生成随机密钥
JWT_SECRET=$(openssl rand -base64 48)
ADMIN_PASS=$(openssl rand -base64 12)

# 3. 提示创建.env
if [ ! -f "$APP_DIR/.env" ]; then
  echo ""
  echo "========================================="
  echo "  请先配置数据库信息！"
  echo "========================================="
  echo "  1. 在宝塔面板中创建数据库:"
  echo "     库名: cake_mall"
  echo "     用户名: cake_mall_user"
  echo "     记下密码!"
  echo ""
  echo "  2. 在宝塔面板 SQL管理 中导入:"
  echo "     $APP_DIR/database/init.sql"
  echo ""
  echo "  配置完成后按回车继续..."
  echo "========================================="
  read -p "数据库密码: " DB_PASS
  read -p "服务器IP/域名: " SERVER_HOST

  cat > "$APP_DIR/.env" << ENVEOF
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=cake_mall_user
DB_PASSWORD=$DB_PASS
DB_NAME=cake_mall
JWT_SECRET=$JWT_SECRET
FRONTEND_URL=http://$SERVER_HOST
ADMIN_EMAIL=admin@cake-mall.com
ADMIN_PASSWORD=$ADMIN_PASS
PORT=3000
NODE_ENV=production
ENVEOF

  echo ".env 已创建"
  echo "管理员: admin@cake-mall.com"
  echo "密码: $ADMIN_PASS"
  echo "请立即登录后台修改密码！"
fi

# 4. 构建
echo "[3/5] 构建后端..."
cd "$BACKEND_DIR"
npm run build

echo "[4/5] 构建前端..."
cd "$FRONTEND_DIR"
npm run build

# 5. PM2启动
echo "[5/5] 启动后端服务..."
pm2 delete cake-mall-backend 2>/dev/null || true
pm2 start "$BACKEND_DIR/dist/main.js" --name cake-mall-backend
pm2 save
pm2 startup

echo ""
echo "========================================="
echo "  部署完成！"
echo "  前端: http://$SERVER_HOST"
echo "  后端: http://$SERVER_HOST/api/products"
echo "  管理后台: http://$SERVER_HOST/admin/login"
echo ""
echo "  管理员邮箱: admin@cake-mall.com"
echo "  管理员密码: $ADMIN_PASS"
echo ""
echo "  Nginx配置已保存到: /tmp/cake-mall-nginx.conf"
echo "  请复制到宝塔网站的配置文件中"
echo "========================================="

# 6. 输出Nginx配置
cat > /tmp/cake-mall-nginx.conf << 'NGINX'
location /api/ {
    proxy_pass http://127.0.0.1:3000/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location / {
    try_files $uri $uri/ /index.html;
}

add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
NGINX
