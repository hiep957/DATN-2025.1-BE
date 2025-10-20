import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Brand } from 'src/common/entities/brand.entity';
import { Category } from 'src/common/entities/category.entity';
import { Color } from 'src/common/entities/color.entity';
import { Size } from 'src/common/entities/size.entity';
import { Product } from 'src/common/entities/product.entity';

import { ProductVariant } from 'src/common/entities/product-variant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Brand, Color, Size, Product, ProductVariant]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule { }
