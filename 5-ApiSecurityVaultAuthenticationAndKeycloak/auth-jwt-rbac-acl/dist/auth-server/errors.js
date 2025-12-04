"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = exports.InvalidRefreshTokenError = exports.TokenExpiredError = exports.InvalidCredentialsError = exports.InvalidAccessTokenError = exports.TokenNotProvidedError = void 0;
class TokenNotProvidedError extends Error {
    constructor(params) {
        super(params?.message ?? "Token not provided", params?.options);
        this.name = "TokenNotProvidedError";
    }
}
exports.TokenNotProvidedError = TokenNotProvidedError;
class InvalidAccessTokenError extends Error {
    constructor(params) {
        super(params?.message ?? "Invalid access token", params?.options);
        this.name = "InvalidAccessTokenError";
    }
}
exports.InvalidAccessTokenError = InvalidAccessTokenError;
class InvalidCredentialsError extends Error {
    constructor(params) {
        super(params?.message ?? "Invalid credentials", params?.options);
        this.name = "InvalidCredentialsError";
    }
}
exports.InvalidCredentialsError = InvalidCredentialsError;
class TokenExpiredError extends Error {
    constructor(params) {
        super(params?.message ?? "Token expired", params?.options);
        this.name = "TokenExpiredError";
    }
}
exports.TokenExpiredError = TokenExpiredError;
class InvalidRefreshTokenError extends Error {
    constructor(params) {
        super(params?.message ?? "Invalid refresh token", params?.options);
        this.name = "InvalidRefreshTokenError";
    }
}
exports.InvalidRefreshTokenError = InvalidRefreshTokenError;
class NotFoundError extends Error {
    constructor(params) {
        super(params?.message ?? "Not found", params?.options);
        this.name = "NotFoundError";
    }
}
exports.NotFoundError = NotFoundError;
