"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
exports.createCartService = createCartService;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../database");
class CartService {
    cartRepository;
    constructor(cartRepository) {
        this.cartRepository = cartRepository;
    }
    async generateCartToken(userId) {
        const cart = await this.cartRepository.findOne({
            where: { userId },
            relations: ["cartProducts", "cartProducts.product"]
        });
        return cart ? jsonwebtoken_1.default.sign({ cart }, null, { algorithm: "none" }) : null;
    }
}
exports.CartService = CartService;
async function createCartService() {
    const { cartRepository } = await (0, database_1.createDatabaseConnection)();
    return new CartService(cartRepository);
}
