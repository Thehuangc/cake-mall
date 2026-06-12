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
  }

  private async seedAdmin() {
    const adminEmail = 'admin@cake-mall.com';
    const existing = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (!existing) {
      const salt = await bcrypt.genSalt();
      const password_hash = await bcrypt.hash('admin123', salt);

      const admin = this.userRepository.create({
        username: 'admin',
        email: adminEmail,
        password_hash,
        role: 'admin',
      });

      await this.userRepository.save(admin);
      this.logger.log('管理员账号已创建: admin@cake-mall.com / admin123');
    }
  }
}
