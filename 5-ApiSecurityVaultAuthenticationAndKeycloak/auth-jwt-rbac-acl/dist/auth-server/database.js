"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSource = void 0;
exports.createDatabaseConnection = createDatabaseConnection;
exports.closeDatabaseConnection = closeDatabaseConnection;
const typeorm_1 = require("typeorm");
const User_1 = require("./entities/User");
const Cart_1 = require("./entities/Cart");
const CartProduct_1 = require("./entities/CartProduct");
const Product_1 = require("./entities/Product");
exports.dataSource = null;
async function createDatabaseConnection() {
    if (!exports.dataSource || !exports.dataSource.isInitialized) {
        exports.dataSource = new typeorm_1.DataSource({
            type: "sqlite",
            database: ":memory:",
            entities: [User_1.User, Cart_1.Cart, CartProduct_1.CartProduct, Product_1.Product],
            synchronize: true,
        });
        await exports.dataSource.initialize();
    }
    return {
        userRepository: exports.dataSource.getRepository(User_1.User),
        cartRepository: exports.dataSource.getRepository(Cart_1.Cart),
        cartProductRepository: exports.dataSource.getRepository(CartProduct_1.CartProduct),
        productRepository: exports.dataSource.getRepository(Product_1.Product),
    };
}
async function closeDatabaseConnection() {
    if (exports.dataSource && exports.dataSource?.isInitialized) {
        await exports.dataSource.destroy();
        exports.dataSource = null;
    }
}
