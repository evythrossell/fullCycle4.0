"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("./auth-server/database");
const fixtures_1 = require("./auth-server/fixtures");
async function bootstrap() {
    await (0, fixtures_1.loadFixtures)();
    const { userRepository } = await (0, database_1.createDatabaseConnection)();
    const user = await userRepository.findOneBy({
        email: "admin@user.com"
    });
    const token = jsonwebtoken_1.default.sign({ name: user.name, email: user.email }, null, {
        expiresIn: "1m",
        subject: user.id + "",
        algorithm: "none",
    });
    console.log(token);
}
bootstrap();
