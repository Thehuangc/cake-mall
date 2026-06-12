import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartDto {
  @ApiProperty({ description: '数量', example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;
}
