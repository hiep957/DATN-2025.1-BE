import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";


@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Get()
    async findAll() {
        const data = await this.categoryService.findAll();
        console.log(data);
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

}