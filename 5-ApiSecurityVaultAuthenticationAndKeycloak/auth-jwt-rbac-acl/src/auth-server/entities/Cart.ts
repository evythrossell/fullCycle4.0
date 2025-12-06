import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CartProduct } from "./CartProduct";

@Entity()
export class Cart {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => CartProduct, (cartProduct) => cartProduct.cart)
    cartProducts: CartProduct[];

    @Column("decimal")
    totalPrice: number;

    @Column()
    totalQuantity: number;
}