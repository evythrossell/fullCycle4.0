"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadFixtures = loadFixtures;
const database_1 = require("./database");
const Cart_1 = require("./entities/Cart");
const CartProduct_1 = require("./entities/CartProduct");
const Product_1 = require("./entities/Product");
const UserService_1 = require("./services/UserService");
async function loadFixtures() {
    const { productRepository, cartRepository, cartProductRepository } = await (0, database_1.createDatabaseConnection)();
    const userService = await (0, UserService_1.createUserService)();
    const user = await userService.create({
        name: "Admin User",
        email: "admin@user.com",
        password: "admin",
    });
    const product = new Product_1.Product();
    product.name = "Sample Product",
        product.price = 100.0;
    await productRepository.save(product);
    const cart = new Cart_1.Cart();
    cart.userId = user.id;
    cart.totalPrice = 100.0;
    cart.totalQuantity = 1;
    await cartRepository.save(cart);
    const cartProduct = new CartProduct_1.CartProduct();
    cartProduct.cart = cart;
    cartProduct.product = product;
    cartProduct.quantity = 1;
    await cartProductRepository.save(cartProduct);
}
