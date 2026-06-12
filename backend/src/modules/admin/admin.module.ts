import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthModule } from '../auth/auth.module';
import { User } from '../user/user.entity';
import { Product } from '../product/product.entity';
import { Category } from '../category/category.entity';
import { Order } from '../order/order.entity';
import { OrderItem } from '../order/order-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Product, Category, Order, OrderItem]),
    AuthModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
