import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCartDto {
  @ApiProperty({ description: '商品ID', example: 1 })
  @IsInt()
  product_id: number;

  @ApiProperty({ description: '数量', example: 1, required: false })
  @IsInt()
  @Min(1)
  quantity?: number = 1;
}
