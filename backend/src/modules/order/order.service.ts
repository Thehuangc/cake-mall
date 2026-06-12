import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { CartItem } from '../cart/cart.entity';
import { Product } from '../product/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(CartItem)
    private cartRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  async createOrder(userId: number, createOrderDto: CreateOrderDto) {
    const { address, remark } = createOrderDto;

    // 获取购物车商品（记录ID用于后续精确删除）
    const cartItems = await this.cartRepository.find({
      where: { user_id: userId },
      relations: ['product'],
    });

    if (cartItems.length === 0) {
      throw new BadRequestException('购物车为空');
    }

    // 使用事务保证原子性
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 生成订单号
      const orderNo = this.generateOrderNo();

      // 在事务内重新检查库存（使用悲观锁防止竞态）
      let totalAmount = 0;
      for (const item of cartItems) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.product_id },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product) {
          throw new BadRequestException(`商品不存在`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(`商品"${product.name}"库存不足`);
        }

        totalAmount += product.price * item.quantity;
      }

      // 创建订单
      const order = this.orderRepository.create({
        order_no: orderNo,
        user_id: userId,
        total_amount: Math.round(totalAmount * 100) / 100,
        address,
        remark,
      });

      const savedOrder = await queryRunner.manager.save(order);

      // 创建订单项并扣减库存
      for (const item of cartItems) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.product_id },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product) {
          throw new BadRequestException('商品不存在');
        }

        const orderItem = this.orderItemRepository.create({
          order_id: savedOrder.id,
          product_id: item.product_id,
          product_name: product.name,
          product_image: product.image,
          price: product.price,
          quantity: item.quantity,
        });

        await queryRunner.manager.save(orderItem);

        // 使用原子SQL扣减库存，防止超卖
        await queryRunner.manager
          .createQueryBuilder()
          .update(Product)
          .set({ stock: () => `stock - ${item.quantity}`, sales: () => `sales + ${item.quantity}` })
          .where('id = :id AND stock >= :qty', { id: item.product_id, qty: item.quantity })
          .execute();
      }

      // 只删除实际参与订单的购物车项（而非全部）
      const cartItemIds = cartItems.map(i => i.id);
      await queryRunner.manager.delete(CartItem, { id: In(cartItemIds) });

      await queryRunner.commitTransaction();

      // 返回订单详情
      return this.findById(userId, savedOrder.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(userId: number, page: number = 1, limit: number = 10, status?: number) {
    const queryBuilder = this.orderRepository.createQueryBuilder('order');

    queryBuilder.where('order.user_id = :userId', { userId });

    if (status !== undefined) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    queryBuilder
      .leftJoinAndSelect('order.items', 'items')
      .orderBy('order.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(userId: number, id: number) {
    const order = await this.orderRepository.findOne({
      where: { id, user_id: userId },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    return order;
  }

  async cancelOrder(userId: number, id: number) {
    const order = await this.findById(userId, id);

    if (order.status !== 0) {
      throw new BadRequestException('只能取消待付款订单');
    }

    // 使用事务恢复库存
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      order.status = 4;
      await queryRunner.manager.save(order);

      // 恢复库存和销量
      for (const item of order.items) {
        if (item.product_id) {
          await queryRunner.manager
            .createQueryBuilder()
            .update(Product)
            .set({ stock: () => `stock + ${item.quantity}`, sales: () => `GREATEST(sales - ${item.quantity}, 0)` })
            .where('id = :id', { id: item.product_id })
            .execute();
        }
      }

      await queryRunner.commitTransaction();
      return order;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private generateOrderNo(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}${random}`;
  }
}
