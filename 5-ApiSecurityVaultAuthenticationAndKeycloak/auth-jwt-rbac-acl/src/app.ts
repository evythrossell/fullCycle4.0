import express from "express";
import { logRequest, logResponse } from "./lib/log";
import { loadFixtures } from "./fixtures";
import { userRouter } from "./router/user-router";
import dotenv from "dotenv";
import { InvalidAccessTokenError, InvalidCredentialsError, TokenNotProvidedError, TokenExpiredError, NotFoundError } from "./errors";
import { AuthenticationService, createAuthenticationService } from "./services/AuthenticationService";
import jwt from "jsonwebtoken";
import { createUserService } from "./services/UserService";
import { createCartService } from "./services/CartService";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(logRequest);
app.use(logResponse);

const protectedRoutes = ['/protected', '/users']

app.use(async (req, res, next) => {
    const isProtectedRoute = protectedRoutes.some(route =>
        req.url.startsWith(route))

    if (!isProtectedRoute) {
        return next();
    }
    const accessToken = req.headers.authorization?.replace('Bearer ', "");

    if (!accessToken) {
        next(new TokenNotProvidedError());
        return;
    }
    try {
        const payload = AuthenticationService.verifyAccessToken(accessToken)
        const userService = await createUserService();
        const user = await userService.findById(+payload.sub);

        req.user = user!;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return next(new TokenExpiredError({ options: { cause: error } }));
        }
        return next(new InvalidAccessTokenError({ options: { cause: error } }));
    }
})

app.use(async (req, res, next) => {
    if (!req.user) {
        return next();
    }

    const cartService = await createCartService();
    const cartToken = await cartService.generateCartToken(req.user.id);

    if (cartToken) {
        res.setHeader("X-Cart-Token", cartToken);
    }
    next();
});

app.use(
    async (
        error: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        if (!error) {
            return next();
        }
        errorHandler(error, req, res, next);
    }
);

app.post("/login", async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const authService = await createAuthenticationService();
        const tokens = await authService.login(email, password);

        res.json(tokens);
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return next(new TokenExpiredError({ options: { cause: error } }));
        } else {
            return next(new InvalidCredentialsError)
        }
    }
});

app.post("/refresh-token", async (req, res, next) => {
    const refreshToken =
        req.body?.refresh_token ||
        req.headers.authorization?.replace("Bearer ", "");

    if (!refreshToken) {
        next(new TokenNotProvidedError());
        return;
    }

    try {
        const authService = await createAuthenticationService();
        const tokens = await authService.doRefreshToken(refreshToken);

        res.json(tokens);
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return next(new TokenExpiredError({ options: { cause: error } }));
        };
    }
})

app.get("/protected", (req, res) => {
    res.status(200).json(req.user)
});

app.use("", userRouter)
app.use(errorHandler);

app.listen(+PORT, "0.0.0.0", async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    await loadFixtures();
});

function errorHandler(
    error: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) {
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
    }, 2))
    console.error(
        "Error details:",
        JSON.stringify(errorDetails, (key, value) => {
            if (key === "stack" && typeof value === "string") {
                return value.split("\n").map((line) => line.trim());
            }
            return value;
        }, 2
        )
    );

    if (error instanceof TokenNotProvidedError) {
        res.status(401).send({ message: "Token not provided" });
        return;
    }

    if (error instanceof InvalidAccessTokenError) {
        res.status(401).send({ message: "Invalid access token" });
        return;
    }

    if (error instanceof InvalidCredentialsError) {
        res.status(401).send({ message: "Invalid credentials" });
        return;
    }

    if (error instanceof TokenExpiredError) {
        res.status(401).send({ message: "Token expired" });
        return;
    }

    if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message })
        return;
    }

    res.status(500).json({ error: "Internal Server Error" });
}
