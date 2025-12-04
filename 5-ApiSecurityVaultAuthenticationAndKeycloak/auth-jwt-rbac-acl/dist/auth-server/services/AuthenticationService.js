"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationService = void 0;
exports.createAuthenticationService = createAuthenticationService;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../errors");
const database_1 = require("../database");
class AuthenticationService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async login(email, password) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user || !user.comparePassword(password)) {
            throw new errors_1.InvalidCredentialsError();
        }
        const accessToken = AuthenticationService.generateAccessToken(user);
        const refreshToken = AuthenticationService.generateRefreshToken(user);
        return {
            access_token: accessToken,
            refresh_token: refreshToken
        };
    }
    static generateAccessToken(user) {
        return jsonwebtoken_1.default.sign({ name: user.name, email: user.email }, process.env.JWT_PRIVATE_KEY, {
            expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
            subject: user.id + "",
            algorithm: 'RS256'
        });
    }
    static verifyAccessToken(token) {
        return jsonwebtoken_1.default.verify(token, process.env.JWT_PUBLIC_KEY, {
            algorithms: ["RS256"]
        });
    }
    static generateRefreshToken(user) {
        return jsonwebtoken_1.default.sign({ name: user.name, email: user.email }, process.env.JWT_PRIVATE_KEY, {
            expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
            subject: user.id + "",
            algorithm: 'RS256'
        });
    }
    static verifyRefreshToken(token) {
        return jsonwebtoken_1.default.verify(token, process.env.JWT_PUBLIC_KEY, {
            algorithms: ["RS256"]
        });
    }
    async doRefreshToken(refreshToken) {
        try {
            const payload = AuthenticationService.verifyRefreshToken(refreshToken);
            const user = await this.userRepository.findOne({
                where: { id: +payload.sub }
            });
            if (!user) {
                throw new errors_1.NotFoundError({ message: "User not found" });
            }
            const newAccessToken = AuthenticationService.generateAccessToken(user);
            const newRefreshToken = AuthenticationService.generateRefreshToken(user);
            return {
                access_token: newAccessToken,
                refresh_token: newRefreshToken
            };
        }
        catch (error) {
            throw new errors_1.InvalidRefreshTokenError({ options: { cause: error } });
        }
    }
}
exports.AuthenticationService = AuthenticationService;
async function createAuthenticationService() {
    const { userRepository } = await (0, database_1.createDatabaseConnection)();
    return new AuthenticationService(userRepository);
}
