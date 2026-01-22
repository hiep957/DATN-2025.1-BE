import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { AuthGuard } from "src/common/guards/auth.guard";
import { Role } from "src/users/entities/role.entity";
import { Roles } from "src/common/decorators/role.decorator";


@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Get()
    async findAll() {
        const data = await this.categoryService.findAll();
        return { data };
    }

    @Post('create')
    @UseGuards(AuthGuard)
    @Roles('ADMIN')
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
    @UseGuards(AuthGuard)
    @Roles('ADMIN')
    async deleteCategory(@Param('id') id: number) {
        const data = await this.categoryService.deleteCategory(id);
        return { data };
    }

    @Patch(':id')
    @UseGuards(AuthGuard)
    @Roles('ADMIN')
    async updateCategory(@Param('id') id: number, @Body() updateCategoryDto: UpdateCategoryDto) {
        const data = await this.categoryService.updateCategory(id, updateCategoryDto);
        return { data };
    }

    @Post('create-size')
    @UseGuards(AuthGuard)
    @Roles('ADMIN')
    async createSize(@Body() body: { code: string; name: string }) {
        const data = await this.categoryService.createSize(body.code, body.name);
        return { data };
    }

    @Post('create-color')
    @UseGuards(AuthGuard)
    @Roles('ADMIN')
    async createColor(@Body() body: { code: string; name: string; englishName: string }) {
        const data = await this.categoryService.createColor(body.code, body.name, body.englishName);
        return { data };
    }

}