# 蛋糕商城系统

一个基于 Vue 3 + NestJS + MySQL 的现代化蛋糕商城系统，包含前台商城和管理后台。

## 技术栈

### 前端
- Vue 3 + Composition API
- Vite 构建工具
- Pinia 状态管理
- Vue Router 路由管理
- Element Plus UI组件库
- Axios HTTP客户端

### 后端
- NestJS 企业级Node.js框架
- TypeORM MySQL ORM
- JWT 用户认证
- Swagger API文档自动生成
- class-validator 数据验证

### 数据库
- MySQL 8.0+

## 功能特性

### 前台商城
- 用户注册/登录（JWT认证）
- 商品列表、详情、搜索
- 商品分类浏览
- 购物车管理
- 订单创建和管理
- 个人信息管理
- 响应式设计
- 优雅的动画过渡效果

### 管理后台
- 管理员登录
- 控制面板（数据统计）
- 用户管理（增删改查）
- 商品管理（增删改查、上下架）
- 分类管理（增删改查）
- 订单管理（查看、发货、取消、删除）

## 快速开始

### 1. 数据库初始化

```sql
-- 执行 database/init.sql 初始化数据库和表
mysql -u root -p < database/init.sql
```

### 2. 启动后端

```bash
cd backend

# 安装依赖
npm install

# 启动开发服务器
npm run start:dev
```

后端将运行在 http://localhost:3000
API文档：http://localhost:3000/api

### 3. 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端将运行在 http://localhost:5173

## 访问地址

### 前台商城
- 首页：http://localhost:5173/
- 商品列表：http://localhost:5173/products
- 购物车：http://localhost:5173/cart
- 订单列表：http://localhost:5173/orders

### 管理后台
- 登录页：http://localhost:5173/admin/login
- 控制面板：http://localhost:5173/admin/dashboard
- 用户管理：http://localhost:5173/admin/users
- 商品管理：http://localhost:5173/admin/products
- 分类管理：http://localhost:5173/admin/categories
- 订单管理：http://localhost:5173/admin/orders

### 管理员账号
- 用户名：admin
- 密码：admin123

## 项目结构

```
cake-mall/
├── frontend/                    # Vue 3 前端
│   ├── src/
│   │   ├── api/                # API请求封装
│   │   │   ├── admin.ts       # 管理后台API
│   │   │   ├── auth.ts        # 认证API
│   │   │   ├── cart.ts        # 购物车API
│   │   │   ├── category.ts    # 分类API
│   │   │   ├── order.ts       # 订单API
│   │   │   ├── product.ts     # 商品API
│   │   │   └── user.ts        # 用户API
│   │   ├── layouts/            # 布局组件
│   │   │   ├── AdminLayout.vue # 管理后台布局
│   │   │   └── MainLayout.vue  # 前台布局
│   │   ├── router/             # 路由配置
│   │   ├── stores/             # Pinia状态管理
│   │   ├── styles/             # 全局样式
│   │   └── views/              # 页面视图
│   │       ├── admin/          # 管理后台页面
│   │       │   ├── CategoryManage.vue
│   │       │   ├── Dashboard.vue
│   │       │   ├── Login.vue
│   │       │   ├── OrderManage.vue
│   │       │   ├── ProductManage.vue
│   │       │   └── UserManage.vue
│   │       ├── auth/           # 认证页面
│   │       ├── cart/           # 购物车
│   │       ├── home/           # 首页
│   │       ├── order/          # 订单
│   │       ├── product/        # 商品
│   │       └── user/           # 用户中心
│   └── ...
│
├── backend/                     # NestJS 后端
│   ├── src/
│   │   ├── modules/            # 业务模块
│   │   │   ├── admin/          # 管理后台模块
│   │   │   ├── auth/           # 认证模块
│   │   │   ├── cart/           # 购物车模块
│   │   │   ├── category/       # 分类模块
│   │   │   ├── order/          # 订单模块
│   │   │   ├── product/        # 商品模块
│   │   │   └── user/           # 用户模块
│   └── ...
│
└── database/                    # 数据库脚本
    └── init.sql
```

## API接口

### 前台接口
- POST /api/auth/register - 用户注册
- POST /api/auth/login - 用户登录
- GET /api/auth/profile - 获取用户信息
- GET /api/products - 获取商品列表
- GET /api/products/:id - 获取商品详情
- GET /api/products/hot - 获取热门商品
- GET /api/products/new - 获取新品商品
- GET /api/categories - 获取所有分类
- GET /api/cart - 获取购物车列表
- POST /api/cart - 添加商品到购物车
- PUT /api/cart/:id - 更新购物车商品数量
- DELETE /api/cart/:id - 删除购物车商品
- POST /api/orders - 创建订单
- GET /api/orders - 获取订单列表
- GET /api/orders/:id - 获取订单详情
- PUT /api/orders/:id/cancel - 取消订单

### 管理后台接口
- GET /api/admin/users - 获取用户列表
- POST /api/admin/users - 创建用户
- PUT /api/admin/users/:id - 更新用户
- DELETE /api/admin/users/:id - 删除用户
- GET /api/admin/products - 获取商品列表
- POST /api/admin/products - 创建商品
- PUT /api/admin/products/:id - 更新商品
- DELETE /api/admin/products/:id - 删除商品
- GET /api/admin/categories - 获取分类列表
- POST /api/admin/categories - 创建分类
- PUT /api/admin/categories/:id - 更新分类
- DELETE /api/admin/categories/:id - 删除分类
- GET /api/admin/orders - 获取订单列表
- PUT /api/admin/orders/:id/status - 更新订单状态
- DELETE /api/admin/orders/:id - 删除订单
- GET /api/admin/dashboard/stats - 获取统计数据

## 动画效果

系统包含以下动画效果：
- 页面切换过渡动画
- 卡片悬浮上升效果
- 按钮点击缩放效果
- 列表项淡入动画
- 购物车商品添加/删除动画
- 滚动视差效果
- Logo浮动动画
- 渐变背景装饰动画

## 注意事项

1. 确保MySQL服务已启动
2. 修改 `backend/src/app.module.ts` 中的数据库连接配置
3. 前端开发服务器会自动代理 `/api` 请求到后端
4. 管理后台默认账号：admin / admin123
