import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";


@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Get()
    async findAll() {
        const data = await this.categoryService.findAll();
        return { data };
    }

    @Post('create')
    async create(@Body() createCategoryDto: CreateCategoryDto) {
        const data = await this.categoryService.create(createCategoryDto);
        return { data };
    }

    @Get(':id')
    async findOne(@Param('id') id: number) {
        const data = await this.categoryService.findOne(id);
        return { data };
    }

    @Delete(':id')
    async deleteCategory(@Param('id') id: number) {
        const data = await this.categoryService.deleteCategory(id);
        return { data };
    }

    @Patch(':id')
    async updateCategory(@Param('id') id: number, @Body() updateCategoryDto: UpdateCategoryDto) {
        const data = await this.categoryService.updateCategory(id, updateCategoryDto);
        return { data };
    }

}