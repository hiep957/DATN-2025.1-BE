import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/search-product.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorators/role.decorator';


@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Get('/categories')
  async getCategoriesList() {
    const categories = await this.productsService.getCategories();
    return categories;
  }

  @Get('/sizes')
  async getSizesList() {
    const sizes = await this.productsService.getSizes();
    return sizes;
  }
  @Get('/colors')
  async getColorsList() {
    const colors = await this.productsService.getColors();
    return colors;
  }

  @Get()
  searchProducts(@Query() query: QueryProductDto) {
    console.log('Search query parameters:', query);
    return this.productsService.findAll(query);
  }

  @Post('test')
  test() {
    return { message: 'Test endpoint is working!', status: 'success' };
  }

  @Post('create')
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  create(@Body() createProductDto: CreateProductDto) {
    console.log(createProductDto);
    return this.productsService.create(createProductDto);
  }

  @Patch('update/:id')
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
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

  @Get('/variants/:variantId')
  getProductVariantById(@Param('variantId') variantId: string) {
    return this.productsService.getProductVariants(variantId);
  }


}
