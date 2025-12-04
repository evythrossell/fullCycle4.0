"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const log_1 = require("../lib/log");
const fixtures_1 = require("./fixtures");
const user_router_1 = require("./router/user-router");
const dotenv_1 = __importDefault(require("dotenv"));
const errors_1 = require("./errors");
const AuthenticationService_1 = require("./services/AuthenticationService");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserService_1 = require("./services/UserService");
const CartService_1 = require("./services/CartService");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use(log_1.logRequest);
app.use(log_1.logResponse);
const protectedRoutes = ['/protected', '/users'];
app.use(async (req, res, next) => {
    const isProtectedRoute = protectedRoutes.some(route => req.url.startsWith(route));
    if (!isProtectedRoute) {
        return next();
    }
    const accessToken = req.headers.authorization?.replace('Bearer ', "");
    if (!accessToken) {
        next(new errors_1.TokenNotProvidedError());
        return;
    }
    try {
        const payload = AuthenticationService_1.AuthenticationService.verifyAccessToken(accessToken);
        const userService = await (0, UserService_1.createUserService)();
        const user = await userService.findById(+payload.sub);
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return next(new errors_1.TokenExpiredError({ options: { cause: error } }));
        }
        return next(new errors_1.InvalidAccessTokenError({ options: { cause: error } }));
    }
});
app.use(async (req, res, next) => {
    if (!req.user) {
        return next();
    }
    const cartService = await (0, CartService_1.createCartService)();
    const cartToken = await cartService.generateCartToken(req.user.id);
    if (cartToken) {
        res.setHeader("X-Cart-Token", cartToken);
    }
    next();
});
app.use(async (error, req, res, next) => {
    if (!error) {
        return next();
    }
    errorHandler(error, req, res, next);
});
app.post("/login", async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const authService = await (0, AuthenticationService_1.createAuthenticationService)();
        const tokens = await authService.login(email, password);
        res.json(tokens);
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return next(new errors_1.TokenExpiredError({ options: { cause: error } }));
        }
        else {
            return next(new errors_1.InvalidCredentialsError);
        }
    }
});
app.post("/refresh-token", async (req, res, next) => {
    const refreshToken = req.body?.refresh_token ||
        req.headers.authorization?.replace("Bearer ", "");
    if (!refreshToken) {
        next(new errors_1.TokenNotProvidedError());
        return;
    }
    try {
        const authService = await (0, AuthenticationService_1.createAuthenticationService)();
        const tokens = await authService.doRefreshToken(refreshToken);
        res.json(tokens);
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return next(new errors_1.TokenExpiredError({ options: { cause: error } }));
        }
        ;
    }
});
app.get("/protected", (req, res) => {
    res.status(200).json(req.user);
});
app.use("", user_router_1.userRouter);
app.use(errorHandler);
app.listen(+PORT, "0.0.0.0", async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    await (0, fixtures_1.loadFixtures)();
});
function errorHandler(error, req, res, next) {
    if (!error) {
        return;
    }
    const errorDetails = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause,
    };
    console.error("Error details:", JSON.stringify(errorDetails, (key, value) => {
        if (key === 'stack' && typeof value === 'string') {
            return value.split('\n').map(line => line.trim());
        }
        return value;
    }, 2));
    console.error("Error details:", JSON.stringify(errorDetails, (key, value) => {
        if (key === "stack" && typeof value === "string") {
            return value.split("\n").map((line) => line.trim());
        }
        return value;
    }, 2));
    if (error instanceof errors_1.TokenNotProvidedError) {
        res.status(401).send({ message: "Token not provided" });
        return;
    }
    if (error instanceof errors_1.InvalidAccessTokenError) {
        res.status(401).send({ message: "Invalid access token" });
        return;
    }
    if (error instanceof errors_1.InvalidCredentialsError) {
        res.status(401).send({ message: "Invalid credentials" });
        return;
    }
    if (error instanceof errors_1.TokenExpiredError) {
        res.status(401).send({ message: "Token expired" });
        return;
    }
    if (error instanceof errors_1.NotFoundError) {
        res.status(404).json({ message: error.message });
        return;
    }
    res.status(500).json({ error: "Internal Server Error" });
}
