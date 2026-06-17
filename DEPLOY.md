# 蛋糕商城 - 腾讯云宝塔8.5 部署指南

## 一、宝塔面板环境安装

登录宝塔面板后，在「软件商店」安装以下软件：

| 软件 | 版本 | 用途 |
|------|------|------|
| Nginx | 1.22+ | Web服务器、反向代理 |
| MySQL | 8.0 | 数据库 |
| PM2管理器 | 最新 | Node进程守护 |
| Node.js | 18.x | 后端运行环境 |

---

## 二、数据库配置

### 1. 创建数据库
宝塔面板 → 数据库 → 添加数据库
- 数据库名: `cake_mall`
- 用户名: `cake_mall_user`
- 密码: 点击随机生成（**记录好密码**）
- 字符集: `utf8mb4`

### 2. 导入初始化脚本
宝塔面板 → 数据库 → 找到 `cake_mall` → 管理 → SQL → 粘贴以下SQL执行：

将 `database/init.sql` 文件内容粘贴进去，点击执行。

---

## 三、上传项目代码

### 1. 上传代码包
宝塔面板 → 文件 → 进入 `/www/wwwroot/` → 新建目录 `cake-mall`
将项目打包上传：

```bash
# 在本地项目目录打包（排除node_modules）
tar --exclude='node_modules' --exclude='.git' --exclude='dist' -czf cake-mall.tar.gz .
```

上传 `cake-mall.tar.gz` 到 `/www/wwwroot/cake-mall/` 并解压。

---

## 四、后端部署

### 1. 安装依赖
宝塔面板 → 终端 或 SSH连接：
```bash
cd /www/wwwroot/cake-mall/backend
npm install
```

### 2. 配置环境变量
在 `/www/wwwroot/cake-mall/` 下创建 `.env`：
```bash
# 数据库
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=cake_mall_user
DB_PASSWORD=你创建的数据库密码
DB_NAME=cake_mall

# JWT密钥（命令行执行: openssl rand -base64 48）
JWT_SECRET=换成生成的随机字符串

# 前端地址
FRONTEND_URL=http://你的服务器IP

# 管理员初始密码
ADMIN_EMAIL=admin@cake-mall.com
ADMIN_PASSWORD=换个安全密码

# 端口
PORT=3000
NODE_ENV=production
```

### 3. PM2启动后端
```bash
cd /www/wwwroot/cake-mall/backend

# 编译
npm run build

# PM2启动
pm2 start dist/main.js --name cake-mall-backend

# 开机自启
pm2 save
pm2 startup
```

### 4. 验证后端
```bash
curl http://localhost:3000/products
# 应返回商品列表JSON
```

---

## 五、前端部署

### 1. 安装依赖并构建
```bash
cd /www/wwwroot/cake-mall/frontend
npm install
npm run build
# 生成产物在 dist/ 目录
```

### 2. Nginx站点配置
宝塔面板 → 网站 → 添加站点

- 域名: 你的服务器IP（或绑定域名）
- 根目录: `/www/wwwroot/cake-mall/frontend/dist`
- PHP版本: 纯静态

### 3. Nginx反向代理配置
点击站点「设置」→ 「配置文件」→ 在 server 块中添加：

```nginx
# API反向代理
location /api/ {
    proxy_pass http://127.0.0.1:3000/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Vue Router history模式
location / {
    try_files $uri $uri/ /index.html;
}

# 安全头
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

### 4. 保存并重启Nginx

---

## 六、安全加固

### 1. 修改管理员密码
部署完成后立即访问 `http://你的IP/admin/login` 登录管理后台，
修改默认管理员密码。

### 2. 防火墙开放端口
宝塔面板 → 安全 → 开放端口：80, 443, 3000(仅内网)

### 3. SSL证书（推荐）
宝塔面板 → 网站 → SSL → Let's Encrypt 申请免费证书

---

## 七、验证部署

| 检查项 | 地址 | 预期 |
|--------|------|------|
| 前端首页 | http://你的IP/ | 显示蛋糕商城首页 |
| 商品列表 | http://你的IP/products | 显示8个商品 |
| 登录页 | http://你的IP/login | 显示登录表单 |
| 管理后台 | http://你的IP/admin/login | 显示管理登录页 |
| API健康检查 | http://你的IP/api/products | 返回JSON |

---

## 八、日常维护

```bash
# 查看后端日志
pm2 logs cake-mall-backend

# 重启后端
pm2 restart cake-mall-backend

# 更新代码后重新部署
cd /www/wwwroot/cake-mall/frontend && npm run build
cd /www/wwwroot/cake-mall/backend && npm run build && pm2 restart cake-mall-backend

# 数据库备份（宝塔面板 → 计划任务 → 添加数据库备份任务）
```
