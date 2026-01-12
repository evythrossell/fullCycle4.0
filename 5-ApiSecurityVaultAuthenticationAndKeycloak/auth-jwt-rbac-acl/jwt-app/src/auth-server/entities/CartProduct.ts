import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./Product";
import { Cart } from "./Cart";

@Entity()
export class CartProduct {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Cart, cart => cart.cartProducts)
    cart: Cart;

    @ManyToOne(() => Product, product => product.cartProducts)
    product: Product;

    @Column()
    quantity: number;
}