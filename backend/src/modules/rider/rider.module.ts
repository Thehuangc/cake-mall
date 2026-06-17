import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RiderService } from './rider.service';
import { RiderController } from './rider.controller';
import { AuthModule } from '../auth/auth.module';
import { Order } from '../order/order.entity';
import { OrderItem } from '../order/order-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    AuthModule,
  ],
  controllers: [RiderController],
  providers: [RiderService],
})
export class RiderModule {}
