import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CartProduct } from "./CartProduct";

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column('decimal')
    price: number;

    @OneToMany(() => CartProduct, cartProduct => cartProduct.product)
    cartProducts: CartProduct[];
}