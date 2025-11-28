import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Category } from "src/common/entities/category.entity";
import { Repository } from "typeorm";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";


@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category) private categoryRepo: Repository<Category>,
    ) { }

    async create(dto: CreateCategoryDto): Promise<Category> {
        console.log(dto);
        const category = this.categoryRepo.create(dto);
        if (dto.parentId) {
            const parent = await this.categoryRepo.findOneBy({ id: dto.parentId });
            if (!parent) throw new NotFoundException('Parent category not found');
            category.parent = parent;
        }
        return this.categoryRepo.save(category);
    }

    async findAll() {

        const data = await this.categoryRepo.find({
            relations: ['parent'],
            order: { id: 'ASC' },
        });
        const categoryTransform = data.map(({ parent, ...rest }) => ({
            ...rest,
            parentId: parent ? parent.id : null,
        }));
        return categoryTransform;
    }


    async findOne(id: number): Promise<Category> {
        const category = await this.categoryRepo.findOne({
            where: { id },
            relations: ['parent', 'children'],
        });
        if (!category) throw new NotFoundException('Category not found');
        return category;
    }

    async deleteCategory(id: number) {
        const result = await this.categoryRepo.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException('Category không tồn tại');
        }

        return { result };
    }

    async updateCategory(id: number, dto: UpdateCategoryDto): Promise<Category> {
        const category = await this.categoryRepo.findOne({
            where: { id },
            relations: ['parent', 'children'],
        });
        if (!category) throw new NotFoundException('Category not found');
        const { name, slug, parentId, thumbnail } = dto;
        if (name) category.name = name;
        if (slug) category.slug = slug;
        if (thumbnail) category.thumbnail = thumbnail;
        if (parentId) {
            const parent = await this.categoryRepo.findOneBy({ id: parentId });
            if (!parent) throw new NotFoundException('Parent category not found');
            category.parent = parent;
        } 
        const updatedCategory = await this.categoryRepo.save(category);
        console.log(updatedCategory);
        return updatedCategory;
    }


}