import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { QueryProductDto } from './dto/query-product.dto';

@ApiTags('商品')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: '获取商品列表' })
  async findAll(@Query() queryDto: QueryProductDto) {
    return this.productService.findAll(queryDto);
  }

  @Get('hot')
  @ApiOperation({ summary: '获取热门商品' })
  async findHot() {
    return this.productService.findHot();
  }

  @Get('new')
  @ApiOperation({ summary: '获取新品商品' })
  async findNew() {
    return this.productService.findNew();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取商品详情' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findById(id);
  }
}
