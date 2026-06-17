import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('管理后台')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // 用户管理
  @Get('users')
  @ApiOperation({ summary: '获取用户列表' })
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('keyword') keyword?: string,
  ) {
    return this.adminService.getUsers(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      keyword,
    );
  }

  @Post('users')
  @ApiOperation({ summary: '创建用户' })
  async createUser(@Body() data: { username: string; email: string; password: string; phone?: string }) {
    return this.adminService.createUser(data);
  }

  @Put('users/:id')
  @ApiOperation({ summary: '更新用户' })
  async updateUser(@Param('id', ParseIntPipe) id: number, @Body() data: { username?: string; phone?: string }) {
    return this.adminService.updateUser(id, data);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: '删除用户' })
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteUser(id);
  }

  // 商品管理
  @Get('products')
  @ApiOperation({ summary: '获取商品列表' })
  async getProducts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('keyword') keyword?: string,
    @Query('category_id') category_id?: string,
  ) {
    return this.adminService.getProducts(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      keyword,
      category_id ? parseInt(category_id, 10) : undefined,
    );
  }

  @Post('products')
  @ApiOperation({ summary: '创建商品' })
  async createProduct(@Body() data: { name: string; description?: string; price: number; original_price?: number; image?: string; category_id?: number; stock?: number }) {
    return this.adminService.createProduct(data);
  }

  @Put('products/:id')
  @ApiOperation({ summary: '更新商品' })
  async updateProduct(@Param('id', ParseIntPipe) id: number, @Body() data: { name?: string; description?: string; price?: number; original_price?: number; image?: string; category_id?: number; stock?: number; status?: number }) {
    return this.adminService.updateProduct(id, data);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: '删除商品' })
  async deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteProduct(id);
  }

  // 分类管理
  @Get('categories')
  @ApiOperation({ summary: '获取分类列表' })
  async getCategories() {
    return this.adminService.getCategories();
  }

  @Post('categories')
  @ApiOperation({ summary: '创建分类' })
  async createCategory(@Body() data: { name: string; icon: string; sort_order?: number }) {
    return this.adminService.createCategory(data);
  }

  @Put('categories/:id')
  @ApiOperation({ summary: '更新分类' })
  async updateCategory(@Param('id', ParseIntPipe) id: number, @Body() data: { name?: string; icon?: string; sort_order?: number }) {
    return this.adminService.updateCategory(id, data);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: '删除分类' })
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteCategory(id);
  }

  // 订单管理
  @Get('orders')
  @ApiOperation({ summary: '获取订单列表' })
  async getOrders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('keyword') keyword?: string,
  ) {
    return this.adminService.getOrders(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      status ? parseInt(status, 10) : undefined,
      keyword,
    );
  }

  @Put('orders/:id/status')
  @ApiOperation({ summary: '更新订单状态' })
  async updateOrderStatus(@Param('id', ParseIntPipe) id: number, @Body() data: { status: number }) {
    return this.adminService.updateOrderStatus(id, data.status);
  }

  @Put('orders/:id/commission')
  @ApiOperation({ summary: '设置订单佣金' })
  async setOrderCommission(
    @Param('id', ParseIntPipe) id: number,
    @Body('commission') commission: number,
  ) {
    return this.adminService.setOrderCommission(id, commission);
  }

  @Delete('orders/:id')
  @ApiOperation({ summary: '删除订单' })
  async deleteOrder(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteOrder(id);
  }

  // 统计数据
  @Get('dashboard/stats')
  @ApiOperation({ summary: '获取统计数据' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }
}
