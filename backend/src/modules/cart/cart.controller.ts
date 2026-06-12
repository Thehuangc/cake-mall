import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartDto } from './dto/add-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('购物车')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: '获取购物车列表' })
  async getCart(@Request() req) {
    return this.cartService.getCart(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: '添加商品到购物车' })
  async addItem(@Request() req, @Body() addCartDto: AddCartDto) {
    return this.cartService.addItem(req.user.id, addCartDto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新购物车商品数量' })
  async updateItem(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    return this.cartService.updateItem(req.user.id, id, updateCartDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除购物车商品' })
  async removeItem(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.cartService.removeItem(req.user.id, id);
  }

  @Delete()
  @ApiOperation({ summary: '清空购物车' })
  async clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.id);
  }
}
