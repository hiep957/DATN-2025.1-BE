import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Product } from 'src/common/entities/product.entity';
import { Review } from 'src/common/entities/review.entity';
import { ReplyReviewDto } from './dto/reply-review.dto';
import { GetReviewDto } from './dto/get-review.dto';


@Injectable()
export class ReviewService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) { }

  async create(createReviewDto: CreateReviewDto) {
    const { rating, comment, image_urls, productId, userId } = createReviewDto;
    const boolean = await this.checkUserPurchasedProduct(userId, productId);
    if (!boolean) {
      throw new BadRequestException('User has not purchased this product');
    }
    const review = this.reviewRepository.create({
      rating,
      comment,
      image_urls,

      product: { id: productId },
      user: { id: userId },
    });
    const savedReview = await this.reviewRepository.save(review);
    if (!savedReview) {
      throw new BadRequestException('Failed to create review');
    }
    return savedReview;
  }

  async getReviewsByProduct(productId: number) {
    const reviews = await this.reviewRepository.find({
      where: { product: { id: productId }, status: 'approved' },
      relations: ['user', 'product'],
    });
    return reviews;
  }

  async userUpdatedProductReview(dto: UpdateReviewDto): Promise<Review | null> {
    const { comment, rating, image_urls, userId, productId } = dto;
    const review = await this.reviewRepository.findOne({
      where: {
        user: { id: userId },
        product: { id: productId },
      },
    });
    if (!review) {
      throw new BadRequestException('Review not found');
    }
    if (comment !== undefined) {
      review.comment = comment;
    }
    if (rating !== undefined) {
      review.rating = rating;
    }
    if (image_urls !== undefined) {
      review.image_urls = image_urls;
    }
    const updatedReview = await this.reviewRepository.save(review);
    return updatedReview;
  }


  async adminUpdateReviewStatus(reviewId: number, status: string): Promise<Review | null> {
    console.log("Updating review status:", reviewId, status);
    const review = await this.reviewRepository.findOne({
      where: { id: +reviewId },
    });
    console.log("Found review:", review);
    if (!review) {
      throw new BadRequestException('Review not found');
    }
    review.status = status;
    const updatedReview = await this.reviewRepository.save(review);
    console.log("Updated review:", updatedReview);
    return updatedReview;
  }



  async adminReplyToReview(dto: ReplyReviewDto): Promise<Review | null> {
    const review = await this.reviewRepository.findOne({
      where: { id: dto.reviewId },
    });
    if (!review) {
      throw new BadRequestException('Review not found');
    }
    review.shopReply = dto.replyContent;
    review.shopRepliedAt = new Date();
    review.shopRepliedBy = { id: dto.adminId } as User;
    const updatedReview = await this.reviewRepository.save(review);
    return updatedReview;
  }

  async checkUserPurchasedProduct(userId: number, productId: number): Promise<boolean> {
    // Logic to check if the user has purchased the product
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['orders', 'orders.orderItems'],
    }
    );
    // Kiểm tra xem user đã mua sản phẩm chưa
    console.log(user);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    //lấy productVariantId từ trong orderItems và so sánh với productVariantId của productId
    let productVariantIds: number[] = [];
    for (const order of user.orders) {
      for (const item of order.orderItems) {
        productVariantIds.push(item.productVariantId);
      }
    }
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['variants'],
    });
    if (!product) {
      throw new BadRequestException('Product not found');
    }
    const productVariantIdsOfProduct = product.variants.map(variant => variant.id);
    for (const id of productVariantIdsOfProduct) {
      if (productVariantIds.includes(id)) {
        return true;
      }
    }
    return false;
  }


  async getReview(dto: GetReviewDto) {
    console.log(dto)
    const { q, status, rating, sortBy, sortOrder, page = 1, limit = 10 } = dto;
    const queryBuilder = this.reviewRepository.createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.product', 'product');
    if (q) {
      queryBuilder.andWhere('user.username LIKE :q OR product.name LIKE :q', { q: `%${q}%` });
    }
    if (status) {
      queryBuilder.andWhere('review.status = :status', { status });
    }
    if (rating) {
      queryBuilder.andWhere('review.rating = :rating', { rating });
    }
    if (sortBy) {
      const order = sortOrder === 'DESC' ? 'DESC' : 'ASC';
      queryBuilder.orderBy(`review.${sortBy}`, order);
    } else {
      queryBuilder.orderBy('review.createdAt', 'ASC');
    }
    queryBuilder.skip((page - 1) * limit).take(limit);
    const [data, total] = await queryBuilder.getManyAndCount();
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }






}
