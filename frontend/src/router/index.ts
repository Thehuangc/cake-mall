import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      children: [
        {
          path: '',
          name: 'Home',
          component: () => import('@/views/home/Home.vue'),
        },
        {
          path: 'products',
          name: 'Products',
          component: () => import('@/views/product/ProductList.vue'),
        },
        {
          path: 'products/:id',
          name: 'ProductDetail',
          component: () => import('@/views/product/ProductDetail.vue'),
        },
        {
          path: 'cart',
          name: 'Cart',
          component: () => import('@/views/cart/Cart.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'checkout',
          name: 'Checkout',
          component: () => import('@/views/order/Checkout.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'orders',
          name: 'Orders',
          component: () => import('@/views/order/OrderList.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'orders/:id',
          name: 'OrderDetail',
          component: () => import('@/views/order/OrderDetail.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'user',
          name: 'User',
          component: () => import('@/views/user/UserProfile.vue'),
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/Login.vue'),
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/auth/Register.vue'),
    },
    // 骑手端路由
    {
      path: '/rider/login',
      name: 'RiderLogin',
      component: () => import('@/views/rider/Login.vue'),
    },
    {
      path: '/rider',
      component: () => import('@/layouts/RiderLayout.vue'),
      meta: { requiresRider: true, noTransition: true },
      children: [
        { path: '', redirect: '/rider/dashboard' },
        { path: 'dashboard', name: 'RiderDashboard', component: () => import('@/views/rider/Dashboard.vue') },
        { path: 'available', name: 'RiderAvailable', component: () => import('@/views/rider/AvailableOrders.vue') },
        { path: 'my-orders', name: 'RiderMyOrders', component: () => import('@/views/rider/MyOrders.vue') },
      ],
    },
    // 管理后台路由
    {
      path: '/admin/login',
      name: 'AdminLogin',
      component: () => import('@/views/admin/Login.vue'),
    },
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAdmin: true, noTransition: true },
      children: [
        {
          path: '',
          redirect: '/admin/dashboard',
        },
        {
          path: 'dashboard',
          name: 'AdminDashboard',
          component: () => import('@/views/admin/Dashboard.vue'),
        },
        {
          path: 'users',
          name: 'AdminUsers',
          component: () => import('@/views/admin/UserManage.vue'),
        },
        {
          path: 'products',
          name: 'AdminProducts',
          component: () => import('@/views/admin/ProductManage.vue'),
        },
        {
          path: 'categories',
          name: 'AdminCategories',
          component: () => import('@/views/admin/CategoryManage.vue'),
        },
        {
          path: 'orders',
          name: 'AdminOrders',
          component: () => import('@/views/admin/OrderManage.vue'),
        },
      ],
    },
    // 404 catch-all
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue'),
    },
  ],
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 管理后台路由守卫
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  if (requiresAdmin) {
    const adminToken = localStorage.getItem('adminToken')
    if (!adminToken) { next('/admin/login'); return }
    next(); return
  }

  // 骑手端路由守卫
  const requiresRider = to.matched.some(record => record.meta.requiresRider)
  if (requiresRider) {
    const token = localStorage.getItem('token')
    if (!token) { next('/rider/login'); return }
    next(); return
  }

  // 前台路由守卫 - 跳转登录时携带原始路径
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  if (requiresAuth && !userStore.isAuthenticated) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  next()
})

export default router
