import { Column, CreateDateColumn, Entity, PrimaryColumn, OneToMany, PrimaryGeneratedColumn, OneToOne, UpdateDateColumn } from "typeorm";
import { RefreshToken } from "./refresh-token.entity";
import { UserRole } from "./user-role.entity";
import { Cart } from "../../common/entities/cart.entity";
import { Order } from "src/common/entities/order.entity";
import { Review } from "src/common/entities/review.entity";
import { ChatSession } from "src/common/entities/chat-session";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;


    @Column({
        type: 'varchar',
        unique: true
    })
    email: string;

    @Column({
        type: 'varchar',
        length: 50,
        unique: true
    })
    username: string;

    @Column({
        type: 'varchar',
        length: 100
    })
    password: string;

    @Column({
        type: 'varchar',
        nullable: true,
    })
    address: string;

    // số điện thoại
    @Column({
        type: 'varchar',
        nullable: true,
    })
    phoneNumber: string;

    @Column({
        type: 'varchar',
        nullable: true
    })
    birthday: string;

    //Giới tính
    @Column({
        type: 'varchar',
        nullable: true
    })
    gender: string;


    @Column({
        type: 'varchar',
        nullable: true
    })
    occupation: string;

    @Column({
        default: "https://github.com/shadcn.png",
        type: 'varchar',
        nullable: true
    })
    avatar: string;

    // 1 User <-> 1 Cart
    @OneToOne(() => Cart, (cart) => cart.user)
    cart: Cart;

    @OneToMany(() => RefreshToken, rt => rt.user)
    refreshTokens: RefreshToken[];

    @OneToMany(() => UserRole, ur => ur.user, { cascade: true })
    userRoles: UserRole[];

    // Một User có thể có NHIỀU Order
    @OneToMany(
        () => Order,
        (order) => order.user // 'user' là tên thuộc tính @ManyToOne bên Order
    )
    orders: Order[]; // Đây là thuộc tính để truy cập mảng Order từ User

    @CreateDateColumn({
        comment: 'The date when the user was created',
    })
    createdAt: Date;
    @UpdateDateColumn({
        comment: 'The date when the user was last updated',
    })
    updatedAt: Date;

    // 1 User -> N Review
    @OneToMany(() => Review, (review) => review.user)
    reviews: Review[];

    @OneToOne(() => ChatSession, (chatSession) => chatSession.user)
    chatSession: ChatSession;

}
