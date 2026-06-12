import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('订单')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: '创建订单' })
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(req.user.id, createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: '获取订单列表' })
  async findAll(@Request() req, @Query() queryDto: QueryOrderDto) {
    return this.orderService.findAll(
      req.user.id,
      queryDto.page,
      queryDto.limit,
      queryDto.status,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '获取订单详情' })
  async findById(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.orderService.findById(req.user.id, id);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: '取消订单' })
  async cancelOrder(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.orderService.cancelOrder(req.user.id, id);
  }
}
