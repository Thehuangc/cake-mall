import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './cart.entity';
import { Product } from '../product/product.entity';
import { AddCartDto } from './dto/add-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getCart(userId: number) {
    const items = await this.cartRepository.find({
      where: { user_id: userId },
      relations: ['product'],
      order: { created_at: 'DESC' },
    });

    const total = items.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);

    return {
      items,
      total: Math.round(total * 100) / 100,
      count: items.length,
    };
  }

  async addItem(userId: number, addCartDto: AddCartDto) {
    const { product_id, quantity = 1 } = addCartDto;

    // 检查商品是否存在
    const product = await this.productRepository.findOne({
      where: { id: product_id, status: 1 },
    });

    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    if (product.stock < quantity) {
      throw new BadRequestException('库存不足');
    }

    // 检查购物车中是否已有该商品
    let cartItem = await this.cartRepository.findOne({
      where: { user_id: userId, product_id },
    });

    if (cartItem) {
      cartItem.quantity += quantity;
      if (cartItem.quantity > product.stock) {
        throw new BadRequestException('库存不足');
      }
    } else {
      cartItem = this.cartRepository.create({
        user_id: userId,
        product_id,
        quantity,
      });
    }

    return this.cartRepository.save(cartItem);
  }

  async updateItem(userId: number, id: number, updateCartDto: UpdateCartDto) {
    const cartItem = await this.cartRepository.findOne({
      where: { id, user_id: userId },
      relations: ['product'],
    });

    if (!cartItem) {
      throw new NotFoundException('购物车商品不存在');
    }

    if (!cartItem.product) {
      throw new NotFoundException('商品已下架');
    }

    if (updateCartDto.quantity > cartItem.product.stock) {
      throw new BadRequestException('库存不足');
    }

    cartItem.quantity = updateCartDto.quantity;

    return this.cartRepository.save(cartItem);
  }

  async removeItem(userId: number, id: number) {
    const cartItem = await this.cartRepository.findOne({
      where: { id, user_id: userId },
    });

    if (!cartItem) {
      throw new NotFoundException('购物车商品不存在');
    }

    await this.cartRepository.remove(cartItem);

    return { message: '删除成功' };
  }

  async clearCart(userId: number) {
    await this.cartRepository.delete({ user_id: userId });

    return { message: '购物车已清空' };
  }
}
