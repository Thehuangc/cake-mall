import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../user/user.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
    await this.seedRider();
  }

  private async seedAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@cake-mall.com';
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      this.logger.warn('未设置 ADMIN_PASSWORD 环境变量，跳过管理员账号创建');
      return;
    }

    const existing = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (!existing) {
      const salt = await bcrypt.genSalt();
      const password_hash = await bcrypt.hash(adminPassword, salt);

      const admin = this.userRepository.create({
        username: 'admin',
        email: adminEmail,
        password_hash,
        role: 'admin',
      });

      await this.userRepository.save(admin);
      this.logger.log(`管理员账号已创建: ${adminEmail}`);
      this.logger.warn('请立即登录并修改默认密码！');
    }
  }

  private async seedRider() {
    const riderEmail = process.env.RIDER_EMAIL || 'rider@cake-mall.com';
    const riderPassword = process.env.RIDER_PASSWORD;
    if (!riderPassword) {
      this.logger.warn('未设置 RIDER_PASSWORD 环境变量，跳过骑手账号创建');
      return;
    }

    const existing = await this.userRepository.findOne({
      where: { email: riderEmail },
    });

    if (!existing) {
      const salt = await bcrypt.genSalt();
      const password_hash = await bcrypt.hash(riderPassword, salt);

      const rider = this.userRepository.create({
        username: 'rider',
        email: riderEmail,
        password_hash,
        role: 'rider',
      });

      await this.userRepository.save(rider);
      this.logger.log(`骑手账号已创建: ${riderEmail}`);
    }
  }
}
