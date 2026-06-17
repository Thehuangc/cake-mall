import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: '邮箱或用户名', example: 'admin' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsString()
  password: string;
}
