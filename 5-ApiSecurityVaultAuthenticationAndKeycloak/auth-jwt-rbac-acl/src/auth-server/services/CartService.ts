import { Repository } from "typeorm";
import { Cart } from "../entities/Cart";
import jwt from "jsonwebtoken";
import { createDatabaseConnection } from "../database";

export class CartService {
    constructor(private cartRepository: Repository<Cart>) { }

    async generateCartToken(userId: number) {
        const cart = await this.cartRepository.findOne({
            where: { userId },
            relations: ["cartProducts", "cartProducts.product"]
        });
        return cart ? jwt.sign({ cart }, null, { algorithm: "none" }) : null;
    }
}

export async function createCartService() {
    const { cartRepository } = await createDatabaseConnection();
    return new CartService(cartRepository);
}