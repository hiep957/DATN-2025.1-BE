import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/common/entities/category.entity';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { Color } from 'src/common/entities/color.entity';
import { Size } from 'src/common/entities/size.entity';



@Module({
  imports: [
    TypeOrmModule.forFeature([Category,Color, Size]),
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule { }

 