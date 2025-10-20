import { Column, CreateDateColumn, Entity, PrimaryColumn, OneToMany, PrimaryGeneratedColumn, OneToOne } from "typeorm";
import { RefreshToken } from "./refresh-token.entity";
import { UserRole } from "./user-role.entity";
import { Cart } from "src/common/entities/cart.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

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
        unique: true
    })
    email: string;

    // 1 User <-> 1 Cart
    @OneToOne(() => Cart, (cart) => cart.user)
    cart: Cart;

    @OneToMany(() => RefreshToken, rt => rt.user)
    refreshTokens: RefreshToken[];

    @OneToMany(() => UserRole, ur => ur.user, { cascade: true })
    userRoles: UserRole[];

    @CreateDateColumn({
        comment: 'The date when the user was created',
    })
    createdAt: Date;
    @CreateDateColumn({
        comment: 'The date when the user was last updated',
    })
    updatedAt: Date;

}
