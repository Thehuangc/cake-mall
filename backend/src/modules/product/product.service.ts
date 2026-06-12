import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Product } from './product.entity';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(queryDto: QueryProductDto) {
    const { page = 1, limit = 10, category_id, keyword, minPrice, maxPrice, sort } = queryDto;

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    queryBuilder.where('product.status = :status', { status: 1 });

    if (category_id) {
      queryBuilder.andWhere('product.category_id = :category_id', { category_id });
    }

    if (keyword) {
      queryBuilder.andWhere('product.name LIKE :keyword', { keyword: `%${keyword}%` });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    switch (sort) {
      case 'price_asc':
        queryBuilder.orderBy('product.price', 'ASC');
        break;
      case 'price_desc':
        queryBuilder.orderBy('product.price', 'DESC');
        break;
      case 'sales':
        queryBuilder.orderBy('product.sales', 'DESC');
        break;
      case 'newest':
        queryBuilder.orderBy('product.created_at', 'DESC');
        break;
      default:
        queryBuilder.orderBy('product.sales', 'DESC');
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, status: 1 },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    return product;
  }

  async findHot(limit: number = 8): Promise<Product[]> {
    return this.productRepository.find({
      where: { status: 1 },
      order: { sales: 'DESC' },
      take: limit,
    });
  }

  async findNew(limit: number = 8): Promise<Product[]> {
    return this.productRepository.find({
      where: { status: 1 },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }
}
