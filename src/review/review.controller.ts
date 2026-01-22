import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ChangeStatusReviewDto, UpdateReviewDto } from './dto/update-review.dto';
import { ReplyReviewDto } from './dto/reply-review.dto';
import { GetReviewDto } from './dto/get-review.dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) { }

  @Post('/create-review')
  create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewService.create(createReviewDto);
  }

  @Patch('/update-review')
  update(@Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewService.userUpdatedProductReview(updateReviewDto);
  }

  @Get('/product/:productId')
  getReviewsByProduct(@Param('productId') productId: string) {
    return this.reviewService.getReviewsByProduct(+productId);
  }

  @Post('/reply-review')
  replyReviewByAdmin(@Body() replyReviewDto: ReplyReviewDto) {
    return this.reviewService.adminReplyToReview(replyReviewDto);
  }
  @Post('/change-status-review')
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  changeStatusReview(@Body() dto: ChangeStatusReviewDto) {
    console.log("Controller - Changing review status:", dto.reviewId, dto.status);
    return this.reviewService.adminUpdateReviewStatus(dto.reviewId, dto.status);
  }

  @Get('/get-reviews')
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  getReviews(@Query() query: GetReviewDto) {
    return this.reviewService.getReview(query);
  }


}
