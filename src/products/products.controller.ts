import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';


@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Get()
  searchProducts(@Query() query: any) {
    console.log('Search query parameters:', query);
    return this.productsService.findAll(query);
  }

  @Post('test')
  test() {
    return { message: 'Test endpoint is working!', status: 'success' };
  }

  @Post('create')
  create(@Body() createProductDto: CreateProductDto) {
    console.log(createProductDto);
    return this.productsService.create(createProductDto);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Get(':id')
  getProductById(@Param('id') id: string) {
    return this.productsService.getProductById(id);
  }

  @Get('find/all')
  findAllForChatbot() {
    return this.productsService.findAllForChatbot();
  }

  // Test service
  @Post('check-quantity/:variantId')
  async checkQuantity(@Param('variantId') variantId: number) {
    const result = await this.productsService.checkQuantityProductVariant(variantId);
    return { available: result };
  }





}
