import { IsNotEmpty } from "class-validator";


export class ReplyReviewDto {
    @IsNotEmpty()
    reviewId: number;
    @IsNotEmpty()
    replyContent: string;   
    @IsNotEmpty()
    adminId: number;
}