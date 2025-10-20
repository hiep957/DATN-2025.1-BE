import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto, UpdateProductImageDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, In, Repository, SelectQueryBuilder } from 'typeorm';
import { Category } from 'src/common/entities/category.entity';
import { Brand } from 'src/common/entities/brand.entity';
import { Product } from 'src/common/entities/product.entity';

import { ProductVariant } from 'src/common/entities/product-variant.entity';
import { Color } from 'src/common/entities/color.entity';
import { Size } from 'src/common/entities/size.entity';


import { count } from 'console';
import { QueryProductDto } from './dto/search-product.dto';
import { ProductImage } from 'src/common/entities/product-image.entity';



/** tiện ích: nhận id hoặc slug nhiều giá trị */
function splitList(val?: string) {
    return (val || '').split(',').map(s => s.trim()).filter(Boolean);
}
function isNumeric(x: string) { return /^\d+$/.test(x); }


@Injectable()
export class ProductsService {

    constructor(
        @InjectRepository(Product) private productRepo: Repository<Product>,
        @InjectRepository(ProductVariant) private variantRepo: Repository<ProductVariant>,
        @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
        @InjectRepository(Brand) private readonly brandRepo: Repository<Brand>,
        @InjectRepository(Color) private readonly productImage: Repository<ProductImage>,
        private dataSource: DataSource
    ) { }

    async create(createProductDto: CreateProductDto) {
        console.log(createProductDto);
        return this.dataSource.transaction(async (manager) => {
            console.log(createProductDto);
            const category = await manager.findOne(Category, {
                where: { id: createProductDto.categoryId }
            })
            if (!category) {
                throw new BadRequestException('Category not found');
            }
            const brand = await manager.findOne(Brand, {
                where: { id: createProductDto.brandId }
            })
            if (!brand) {
                throw new BadRequestException('Brand not found');
            }



            // Tìm sản phẩm trùng tên
            const existingProduct = await manager.findOne(Product, {
                where: { name: createProductDto.name }
            });
            if (existingProduct) {
                throw new BadRequestException('Product name already exists');
            }


            const product = manager.create(Product, {
                name: createProductDto.name,
                slug: createProductDto.slug,
                description: createProductDto.description,
                category,
                brand,
                specs: createProductDto.specs,
                image_colors: createProductDto.image_colors,
                is_published: true
            })
            await manager.save(product);

            if (createProductDto.images) {
                for (const img of createProductDto.images) {
                    const productImage = manager.create('ProductImage', {
                        url: img.url,
                        product
                    })
                    await manager.save(productImage);
                }
            }
            //2. Tạo variant
            for (const v of createProductDto.variants) {
                const color = await manager.findOneOrFail('Color', { where: { id: v.colorId } });
                const size = await manager.findOneOrFail('Size', { where: { id: v.sizeId } });


                const variant = manager.create('ProductVariant', {
                    sku: v.sku,
                    price: v.price,
                    compare_at_price: v.compare_at_price,
                    quantity: v.quantity,
                    product,
                    color,
                    size
                })
                await manager.save(variant);

            }


            return await manager.findOne(Product, {
                where: { id: product.id },
                relations: {
                    brand: true,
                    category: true,
                    variants: { color: true, size: true },

                }
            });

        })
    }


    async update(productId: string, dto: UpdateProductDto) {
        console.log('Update DTO:', dto);
        return this.dataSource.transaction(async (manager) => {
            console.log('Update DTO:', dto);
            // 1. Tải product + quan hệ
            const product = await manager.findOne(Product, {
                where: { id: +productId },
                relations: {
                    variants: {},
                    category: true,
                    brand: true,
                    images: true,
                },
            });
            console.log('Loaded product for update:', product);
            if (!product) throw new BadRequestException('Product not found');

            // 2) Cập nhật các field đơn
            if (dto.name !== undefined) product.name = dto.name;
            if (dto.slug !== undefined) product.slug = dto.slug;
            if (dto.description !== undefined) product.description = dto.description ?? null;
            if (dto.is_published !== undefined) product.is_published = !!dto.is_published;
            if (dto.specs !== undefined) product.specs = dto.specs ?? null;
            if (dto.image_colors !== undefined) product.image_colors = dto.image_colors ?? null;

            // 3. cập nhật category
            if (dto.categoryId !== undefined) {
                if (dto.categoryId === null) {
                    product.category = undefined;
                } else {
                    product.category = await manager.findOneByOrFail(Category, { id: dto.categoryId });
                }
            }

            // 4) Cập nhật brand
            if (dto.brandId !== undefined) {
                if (dto.brandId === null) {
                    product.brand = undefined;
                } else {
                    product.brand = await manager.findOneByOrFail(Brand, { id: dto.brandId });
                }
            }

            await manager.save(product);



            // ====== 5) Đồng bộ variants 
            if (dto.variants !== undefined) {
                const existingVariants = product.variants ?? [];

                // map nhanh: theo id và sku
                const byId = new Map<number, ProductVariant>();
                const bySku = new Map<string, ProductVariant>();

                for (const v of existingVariants) {
                    if (v.id) byId.set(v.id, v);
                    if (v.sku) bySku.set(v.sku, v);
                }

                // Đánh dấu biến thể còn/không còn trong payload
                const seenVariantIds = new Set<number>();

                for (const incoming of dto.variants) {
                    //Nếu có cờ xoá trực tiếp theo id/sku
                    if (incoming._destroy) {
                        let toDelete: ProductVariant | undefined;
                        if (incoming.id) toDelete = byId.get(incoming.id);
                        else if (incoming.sku) toDelete = bySku.get(incoming.sku);
                        if (toDelete) {
                            console.log('Delete variant', toDelete.id, toDelete);
                            await manager.remove(ProductVariant, toDelete);
                            byId.delete(toDelete.id);
                            bySku.delete(toDelete.sku);
                        }
                    }

                    // Tìm biến thể cũ theo id hoặc sku
                    let variant: ProductVariant | undefined;
                    if (incoming.id) variant = byId.get(incoming.id);
                    else if (incoming.sku) variant = bySku.get(incoming.sku);

                    // Chuẩn hoá số
                    const toNumericString = (v: any) =>
                        v === null || v === undefined ? null : String(v);

                    // Tạo mới nếu chưa tồn tại
                    if (!variant) {
                        // bắt buộc phải có sku, colorId, sizeId khi tạo
                        console.log('Create new variant', incoming);
                        if (!incoming.sku) {
                            throw new BadRequestException('Variant.sku is required when creating a new variant');
                        }
                        if (!incoming.colorId || !incoming.sizeId) {
                            throw new BadRequestException('colorId and sizeId are required when creating a new variant');
                        }

                        const color = await manager.findOneByOrFail(Color, { id: incoming.colorId });
                        const size = await manager.findOneByOrFail(Size, { id: incoming.sizeId });

                        variant = manager.create(ProductVariant, {
                            product: product,
                            sku: incoming.sku,
                            price: toNumericString(incoming.price) ?? '0',
                            compare_at_price: toNumericString(incoming.compare_at_price) ?? undefined,
                            quantity: incoming.quantity ?? 0,
                            color,
                            size,
                        });
                        variant = await manager.save(variant);
                        // Cập nhật maps
                        byId.set(variant.id, variant);
                        bySku.set(variant.sku, variant);
                    } else {
                        // Cập nhật trường cơ bản nếu có
                        if (incoming.sku !== undefined && incoming.sku !== variant.sku) {
                            variant.sku = incoming.sku; // có unique index -> có thể throw nếu trùng
                        }
                        if (incoming.price !== undefined) {
                            variant.price = toNumericString(incoming.price) ?? variant.price;
                        }
                        if (incoming.compare_at_price !== undefined) {
                            const compareAtPrice = toNumericString(incoming.compare_at_price);
                            variant.compare_at_price = compareAtPrice === null ? undefined : compareAtPrice;
                        }
                        if (incoming.quantity !== undefined) {
                            variant.quantity = incoming.quantity;
                        }
                        if (incoming.colorId !== undefined) {
                            variant.color = await manager.findOneByOrFail(Color, { id: incoming.colorId });
                        }
                        if (incoming.sizeId !== undefined) {
                            variant.size = await manager.findOneByOrFail(Size, { id: incoming.sizeId });
                        }
                        variant = await manager.save(variant);
                    }
                    seenVariantIds.add(variant.id);



                }
                const toRemove = existingVariants.filter((v) => !seenVariantIds.has(v.id));
                if (toRemove.length) {
                    await manager.remove(ProductVariant, toRemove);
                }
            }

        
            // ====== 5) Đồng bộ images
            if (dto.images !== undefined) {
                // Snapshot các ID ảnh hiện có NGAY TỪ ĐẦU
                const existingImages = product.images ?? [];
                const existingIds = new Set<number>(existingImages.map(i => i.id!).filter(Boolean));

                // Index nhanh
                const byId = new Map<number, ProductImage>();
                const byUrl = new Map<string, ProductImage>();
                for (const img of existingImages) {
                    if (img.id) byId.set(img.id, img);
                    if (img.url) byUrl.set(img.url, img);
                }

                const seenImageIds = new Set<number>();
                const deletedImageIds = new Set<number>(); // để tránh xoá 2 lần

                const dedupKey = (i: UpdateProductImageDto) => i.id ? `id:${i.id}` : `url:${i.url ?? ''}`;
                const seenInput = new Set<string>();

                for (const incoming of dto.images) {
                    const key = dedupKey(incoming);
                    if (seenInput.has(key)) continue;
                    seenInput.add(key);

                    let target: ProductImage | undefined;
                    if (incoming.id != null) target = byId.get(incoming.id);
                    else if (incoming.url) target = byUrl.get(incoming.url);

                    // 1) Xoá
                    if (incoming._destroy) {
                        if (target?.id && !deletedImageIds.has(target.id)) {
                            const id = target.id; // LƯU ID trước khi xoá
                            console.log('Destroy image by id:', id);
                            await manager.delete(ProductImage, id); // dùng delete theo id, KHÔNG dùng remove(instance)
                            deletedImageIds.add(id);
                            existingIds.delete(id);
                            byId.delete(id);
                            if (target.url) byUrl.delete(target.url);
                        }
                        continue;
                    }

                    // 2) Tạo mới
                    if (!target) {
                        if (!incoming.url) throw new BadRequestException('Image.url is required when creating a new image');
                        const created = manager.create(ProductImage, { product, url: incoming.url });
                        const saved = await manager.save(ProductImage, created);
                        byId.set(saved.id, saved);
                        if (saved.url) byUrl.set(saved.url, saved);
                        seenImageIds.add(saved.id);
                        existingIds.add(saved.id);
                        continue;
                    }

                    // 3) Cập nhật
                    if (incoming.url !== undefined && incoming.url !== target.url) {
                        target.url = incoming.url;
                        await manager.save(ProductImage, target);
                        // Rebuild byUrl nếu cần
                        byUrl.clear();
                        for (const im of byId.values()) if (im.url) byUrl.set(im.url, im);
                    }
                    if (target.id) {
                        seenImageIds.add(target.id);
                    }
                }

                // 4) Xoá các ảnh KHÔNG còn trong payload (merge strategy)
                // Lúc này chỉ còn làm việc với ID, không dùng object để tránh "id bị mutate = undefined"
                const toRemoveIds = [...existingIds].filter(id => !seenImageIds.has(id) && !deletedImageIds.has(id));
                if (toRemoveIds.length) {
                    await manager.delete(ProductImage, toRemoveIds);
                }
            }

            // Trả về product đã cập nhật (đính kèm relations)
            const reloaded = await manager.findOne(Product, {
                where: { id: product.id },
                relations: {
                    variants: {},
                    category: true,
                    brand: true,
                },
            });
            return reloaded;
        })
    }


    async findAllForChatbot() {
        return this.productRepo.find({ relations: { variants: {}, category: true, brand: true } });
    }


    async getProductById(id: string) {
        const product = await this.productRepo.findOne({
            where: { id: +id },
            relations: {
                variants: {},
                category: true,
                brand: true,
                images: {},
            }
        })
        console.log('Fetched product by ID:', product);
        if (!product) {
            throw new BadRequestException('Product not found');
        }
        console.log(product);
        return product;
    }


    async remove(id: string) {
        const product = await this.productRepo.findOne({ where: { id: +id } });
        if (!product) {
            throw new BadRequestException('Product not found');
        }
        await this.productRepo.remove(product);
    }


    async checkQuantityProductVariant(variantId: number): Promise<number> {
        const variant = await this.variantRepo.findOne({ where: { id: variantId } });
        if (!variant) {
            throw new BadRequestException('Product variant not found');
        }
        return variant.quantity > 0 ? 1 : 0;
    }
    //https://gemini.google.com/app/3110b823d92149b0?android-min-version=301356232&ios-min-version=322.0&is_sa=1&campaign_id=test_autosubmit&pt=9008&mt=8&_gl=1*1ls3lvc*_gcl_au*NDczMDMwMDc1LjE3NTc4MDk4NDQuNTgxMTA1OTYwLjE3NTc4MDk5NzIuMTc1NzgwOTk3MQ..
    async findAll(query: QueryProductDto) {
        const {
            q,
            category,
            brand,
            minPrice,
            maxPrice,
            colors,
            sizes,
            sortBy,
            sortOrder,
            page = 1,
            limit = 10,
        } = query;
        const qb = this.productRepo.createQueryBuilder('product');
        qb.leftJoinAndSelect('product.category', 'category');
        qb.leftJoinAndSelect('product.brand', 'brand');
        // Eager loading đã có 'images', nếu cần variants thì thêm join
        qb.leftJoinAndSelect('product.images', 'images');
        qb.leftJoinAndSelect('product.variants', 'variants');
        qb.leftJoinAndSelect('variants.color', 'variant_color');
        qb.leftJoinAndSelect('variants.size', 'variant_size');

        // 1. Lọc theo các thuộc tính của Product
        if (q) {
            qb.andWhere('(product.name ILIKE :q OR product.description ILIKE :q)', {
                q: `%${q}%`,
            });
        }
        if (category) {
            qb.andWhere('category.slug = :category', { category });
        }
        if (brand) {
            qb.andWhere('brand.slug = :brand', { brand });
        }

        // 2. Lọc theo các thuộc tính của Variant (phần khó)
        // Chúng ta cần tìm các product ID có variant thỏa mãn điều kiện
        const variantConditionsMet =
            minPrice || maxPrice || (colors && colors.length > 0) || (sizes && sizes.length > 0);

        if (variantConditionsMet) {
            // Tạo một subquery để lấy tất cả product.id có variant thỏa mãn
            const subQuery = this.variantRepo.createQueryBuilder('variant_sub')
                .select('variant_sub.productId')
                .leftJoin('variant_sub.color', 'color_sub')
                .leftJoin('variant_sub.size', 'size_sub');

            if (minPrice) {
                subQuery.andWhere('variant_sub.price >= :minPrice', { minPrice });
            }
            if (maxPrice) {
                subQuery.andWhere('variant_sub.price <= :maxPrice', { maxPrice });
            }
            if (colors && colors.length > 0) {
                subQuery.andWhere('color_sub.code IN (:...colors)', { colors });
            }
            if (sizes && sizes.length > 0) {
                subQuery.andWhere('size_sub.code IN (:...sizes)', { sizes });
            }

            // Áp dụng subquery vào query chính
            qb.andWhere(`product.id IN (${subQuery.getQuery()})`);
            // Đừng quên set parameters cho subquery
            qb.setParameters(subQuery.getParameters());
        }

        // 3. Sắp xếp
        if (sortBy === 'price') {
            // Sắp xếp theo giá của variant sẽ phức tạp, tạm sắp xếp theo thuộc tính product
            // Một cách tiếp cận là sắp xếp theo min price của product's variants
            // Tạm thời để đơn giản, ta sẽ sort theo các trường của product
            qb.orderBy(`product.${sortBy}`, sortOrder);
        } else {
            qb.orderBy(`product.${sortBy || 'created'}`, sortOrder || 'DESC');
        }

        // 4. Phân trang
        qb.skip((page - 1) * limit).take(limit);

        // Lấy kết quả và tổng số lượng
        const [products, total] = await qb.getManyAndCount();

        return {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            data: products
        };

    }


}
