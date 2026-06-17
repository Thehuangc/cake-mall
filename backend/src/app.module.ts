import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { CategoryModule } from './modules/category/category.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { AdminModule } from './modules/admin/admin.module';
import { RiderModule } from './modules/rider/rider.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USER || 'cake_mall_user',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'cake_mall',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // 生产环境禁用自动同步
      charset: 'utf8mb4',
    }),
    AuthModule,
    UserModule,
    ProductModule,
    CategoryModule,
    CartModule,
    OrderModule,
    AdminModule,
    RiderModule,
  ],
})
export class AppModule {}
