import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({
    description: '收货地址',
    example: {
      name: '张三',
      phone: '13800138000',
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      address: '科技园南路1号',
    },
  })
  @IsObject()
  address: {
    name: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    address: string;
  };

  @ApiProperty({ description: '备注', required: false, example: '请尽快送达' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  remark?: string;
}
