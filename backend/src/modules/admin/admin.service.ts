import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../user/user.entity';
import { Product } from '../product/product.entity';
import { Category } from '../category/category.entity';
import { Order } from '../order/order.entity';
import { OrderItem } from '../order/order-item.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private dataSource: DataSource,
  ) {}

  // ─── 用户管理 ─────────────────────────────

  async getUsers(page: number = 1, limit: number = 10, keyword?: string) {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (keyword) {
      queryBuilder.where(
        'user.username LIKE :keyword OR user.email LIKE :keyword OR user.phone LIKE :keyword',
        { keyword: `%${keyword}%` }
      );
    }

    queryBuilder
      .select(['user.id', 'user.username', 'user.email', 'user.phone', 'user.avatar', 'user.role', 'user.created_at'])
      .orderBy('user.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();
    return { items, total, page, limit };
  }

  async createUser(data: { username: string; email: string; password: string; phone?: string }) {
    const existingUser = await this.userRepository.findOne({
      where: [{ username: data.username }, { email: data.email }],
    });

    if (existingUser) {
      throw new ConflictException('用户名或邮箱已存在');
    }

    const salt = await bcrypt.genSalt();
    const password_hash = await bcrypt.hash(data.password, salt);

    const user = this.userRepository.create({
      username: data.username,
      email: data.email,
      password_hash,
      phone: data.phone,
    });

    const saved = await this.userRepository.save(user);
    const { password_hash: _, ...result } = saved;
    return result;
  }

  async updateUser(id: number, data: { username?: string; phone?: string }) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    Object.assign(user, data);
    const saved = await this.userRepository.save(user);
    const { password_hash: _, ...result } = saved;
    return result;
  }

  async deleteUser(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 检查是否有关联订单
    const orderCount = await this.orderRepository.count({ where: { user_id: id } });
    if (orderCount > 0) {
      throw new BadRequestException(`该用户有 ${orderCount} 个订单，无法删除。请先处理相关订单。`);
    }

    const { password_hash: _, ...result } = user;
    await this.userRepository.remove(user);
    return result;
  }

  // ─── 商品管理 ─────────────────────────────

  async getProducts(page: number = 1, limit: number = 10, keyword?: string, category_id?: number) {
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    queryBuilder.leftJoinAndSelect('product.category', 'category');

    if (keyword) {
      queryBuilder.where('product.name LIKE :keyword', { keyword: `%${keyword}%` });
    }

    if (category_id) {
      queryBuilder.andWhere('product.category_id = :category_id', { category_id });
    }

    queryBuilder
      .orderBy('product.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();
    return { items, total, page, limit };
  }

  async createProduct(data: {
    name: string;
    description?: string;
    price: number;
    original_price?: number;
    image?: string;
    category_id?: number;
    stock?: number;
  }) {
    const product = this.productRepository.create({
      name: data.name,
      description: data.description,
      price: data.price,
      original_price: data.original_price,
      image: data.image,
      category_id: data.category_id,
      stock: data.stock ?? 0,
    });
    return this.productRepository.save(product);
  }

  async updateProduct(id: number, data: {
    name?: string;
    description?: string;
    price?: number;
    original_price?: number;
    image?: string;
    category_id?: number;
    stock?: number;
    status?: number;
  }) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    // 只允许更新指定字段
    if (data.name !== undefined) product.name = data.name;
    if (data.description !== undefined) product.description = data.description;
    if (data.price !== undefined) product.price = data.price;
    if (data.original_price !== undefined) product.original_price = data.original_price;
    if (data.image !== undefined) product.image = data.image;
    if (data.category_id !== undefined) product.category_id = data.category_id;
    if (data.stock !== undefined) product.stock = data.stock;
    if (data.status !== undefined) product.status = data.status;

    return this.productRepository.save(product);
  }

  async deleteProduct(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    return this.productRepository.remove(product);
  }

  // ─── 分类管理 ─────────────────────────────

  async getCategories() {
    return this.categoryRepository.find({
      order: { sort_order: 'ASC' },
    });
  }

  async createCategory(data: { name: string; icon: string; sort_order?: number }) {
    const category = this.categoryRepository.create(data);
    return this.categoryRepository.save(category);
  }

  async updateCategory(id: number, data: { name?: string; icon?: string; sort_order?: number }) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    if (data.name !== undefined) category.name = data.name;
    if (data.icon !== undefined) category.icon = data.icon;
    if (data.sort_order !== undefined) category.sort_order = data.sort_order;

    return this.categoryRepository.save(category);
  }

  async deleteCategory(id: number) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    return this.categoryRepository.remove(category);
  }

  // ─── 订单管理 ─────────────────────────────

  async getOrders(page: number = 1, limit: number = 10, status?: number, keyword?: string) {
    const queryBuilder = this.orderRepository.createQueryBuilder('order');

    queryBuilder
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.items', 'items');

    if (status !== undefined) {
      queryBuilder.where('order.status = :status', { status });
    }

    if (keyword) {
      queryBuilder.andWhere(
        '(order.order_no LIKE :keyword OR user.username LIKE :keyword)',
        { keyword: `%${keyword}%` }
      );
    }

    queryBuilder
      .orderBy('order.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();
    return { items, total, page, limit };
  }

  // 合法的状态转换映射
  private readonly validTransitions: Record<number, number[]> = {
    0: [1, 4],  // 待付款 → 已付款、已取消
    1: [2, 4],  // 已付款 → 已发货、已取消
    2: [3],     // 已发货 → 已完成
    3: [],      // 已完成 → 不可变更
    4: [],      // 已取消 → 不可变更
  };

  async updateOrderStatus(id: number, status: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (status < 0 || status > 4) {
      throw new BadRequestException('无效的订单状态值');
    }

    const allowed = this.validTransitions[order.status] || [];
    if (!allowed.includes(status)) {
      throw new BadRequestException(`不允许从状态${order.status}转换到状态${status}`);
    }

    // 如果是取消订单，需要恢复库存
    if (status === 4 && order.status !== 4) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        order.status = 4;
        await queryRunner.manager.save(order);

        for (const item of order.items) {
          if (item.product_id) {
            await queryRunner.manager
              .createQueryBuilder()
              .update(Product)
              .set({
                stock: () => `stock + ${item.quantity}`,
                sales: () => `GREATEST(sales - ${item.quantity}, 0)`,
              })
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

    order.status = status;
    return this.orderRepository.save(order);
  }

  async deleteOrder(id: number) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    return this.orderRepository.remove(order);
  }

  // ─── 统计数据 ─────────────────────────────

  async getDashboardStats() {
    const userCount = await this.userRepository.count();
    const productCount = await this.productRepository.count();
    const orderCount = await this.orderRepository.count();

    const totalSales = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total_amount)', 'total')
      .where('order.status IN (:...statuses)', { statuses: [1, 2, 3] })
      .getRawOne();

    return {
      userCount,
      productCount,
      orderCount,
      totalSales: Number(totalSales?.total) || 0,
    };
  }
}
