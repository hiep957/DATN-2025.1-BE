import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Product } from "./product.entity";



@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    rating: number

    @Column({ type: 'text', nullable: true })
    comment?: string

    @Column({ type: 'simple-array', nullable: true })
    image_urls?: string[]

    @ManyToOne(() => User, (user) => user.reviews, {
        nullable: true,
        onDelete: 'SET NULL', // xoá user thì set null userId trong review
    })
    user: User;

    // N Review -> 1 Product
    @ManyToOne(() => Product, (product) => product.reviews, {
        nullable: false,
        onDelete: 'CASCADE', // xoá product thì xoá luôn review
    })
    product: Product;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column('text', { nullable: true })
    shopReply?: string;

    // thời gian phản hồi
    @Column({ type: 'timestamp', nullable: true })
    shopRepliedAt?: Date;

    // ai trả lời (admin / staff) - optional
    @ManyToOne(() => User, { nullable: true })
    shopRepliedBy?: User;

    @Column({type:'text', default:'pending'})
    status: string; 
}