import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Category } from "src/common/entities/category.entity";
import { Repository } from "typeorm";
import { CreateCategoryDto } from "./dto/create-category.dto";


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

    async findAll(): Promise<Category[]> {

        const data = await this.categoryRepo.find({
            relations: ['parent', 'children'],
            order: { id: 'DESC' },
        });

        return data;
    }

    async findOne(id: number): Promise<Category> {
        const category = await this.categoryRepo.findOne({
            where: { id },
            relations: ['parent', 'children'],
        });
        if (!category) throw new NotFoundException('Category not found');
        return category;
    }
}