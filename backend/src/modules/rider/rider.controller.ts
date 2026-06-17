import { Controller, Get, Put, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RiderService } from './rider.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('骑手端')
@Controller('rider')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('rider')
@ApiBearerAuth()
export class RiderController {
  constructor(private readonly riderService: RiderService) {}

  @Get('orders')
  @ApiOperation({ summary: '可接订单列表' })
  async getAvailableOrders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.riderService.getAvailableOrders(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('my-orders')
  @ApiOperation({ summary: '我的订单' })
  async getMyOrders(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.riderService.getMyOrders(
      req.user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      status ? parseInt(status) : undefined,
    );
  }

  @Put('orders/:id/accept')
  @ApiOperation({ summary: '接单' })
  async acceptOrder(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.riderService.acceptOrder(req.user.id, id);
  }

  @Put('orders/:id/pickup')
  @ApiOperation({ summary: '取货' })
  async pickupOrder(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.riderService.pickupOrder(req.user.id, id);
  }

  @Put('orders/:id/deliver')
  @ApiOperation({ summary: '送达' })
  async deliverOrder(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.riderService.deliverOrder(req.user.id, id);
  }

  @Get('stats')
  @ApiOperation({ summary: '骑手统计' })
  async getStats(@Request() req) {
    return this.riderService.getStats(req.user.id);
  }
}
