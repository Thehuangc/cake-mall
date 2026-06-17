import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../order/order.entity';

@Injectable()
export class RiderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  // 可接订单：已付款(status=1) 且未派送(rider_id=null)
  async getAvailableOrders(page = 1, limit = 10) {
    const [items, total] = await this.orderRepository.findAndCount({
      where: { status: 1, rider_id: undefined as any },
      relations: ['items', 'user'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // filter null rider_id manually since undefined doesn't work well
    const filtered = items.filter(o => !o.rider_id);
    return { items: filtered, total: filtered.length, page, limit };
  }

  // 我的订单
  async getMyOrders(riderId: number, page = 1, limit = 10, status?: number) {
    const qb = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.user', 'user')
      .where('order.rider_id = :riderId', { riderId });

    if (status !== undefined) {
      qb.andWhere('order.status = :status', { status });
    }

    qb.orderBy('order.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  // 接单
  async acceptOrder(riderId: number, orderId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });

    if (!order) throw new NotFoundException('订单不存在');
    if (order.status !== 1) throw new BadRequestException('该订单不可接取');
    if (order.rider_id) throw new BadRequestException('该订单已被其他骑手接取');

    order.rider_id = riderId;
    await this.orderRepository.save(order);

    return order;
  }

  // 取货：已付款(1) → 已取货(2)
  async pickupOrder(riderId: number, orderId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, rider_id: riderId },
      relations: ['items'],
    });

    if (!order) throw new NotFoundException('订单不存在或不属于您');
    if (order.status !== 1) throw new BadRequestException('只能取货已付款的订单');

    order.status = 2;
    await this.orderRepository.save(order);
    return order;
  }

  // 送达：已取货(2) → 已完成(3)
  async deliverOrder(riderId: number, orderId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, rider_id: riderId },
      relations: ['items'],
    });

    if (!order) throw new NotFoundException('订单不存在或不属于您');
    if (order.status !== 2) throw new BadRequestException('只能送达已取货的订单');

    order.status = 3;
    order.delivered_at = new Date();
    await this.orderRepository.save(order);
    return order;
  }

  // 骑手统计
  async getStats(riderId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalOrders = await this.orderRepository.count({ where: { rider_id: riderId } });
    const todayOrders = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.rider_id = :riderId', { riderId })
      .andWhere('order.created_at >= :today', { today })
      .getCount();

    const totalCommission = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.commission)', 'sum')
      .where('order.rider_id = :riderId', { riderId })
      .andWhere('order.status = 3')
      .getRawOne();

    const pendingOrders = await this.orderRepository.count({
      where: { rider_id: riderId, status: 2 },
    });

    return {
      totalOrders,
      todayOrders,
      totalCommission: Number(totalCommission?.sum) || 0,
      pendingOrders,
    };
  }
}
