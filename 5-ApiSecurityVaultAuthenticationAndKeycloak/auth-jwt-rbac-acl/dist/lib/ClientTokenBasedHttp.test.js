"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const ClientTokenBasedHttp_1 = require("./ClientTokenBasedHttp");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
(0, node_test_1.beforeEach)(() => {
    //reset the global fetch mock before each test
    //@ts-ignore - mock.method is valid
    node_test_1.mock.method(global, "fetch", async (url, config) => {
        if (url.endsWith("/login")) {
            const access_token = jsonwebtoken_1.default.sign({ foo: "bar" }, "secret", { expiresIn: "1s" });
            const refresh_token = jsonwebtoken_1.default.sign({ foo: "bar" }, "secret", { expiresIn: "7d" });
            return new Response(JSON.stringify({ access_token, refresh_token }));
        }
        return new Response(JSON.stringify({ data: "success" }));
    });
});
(0, node_test_1.test)("should check token expiration before making request", async () => {
    let refreshCalled = false;
    const client = new ClientTokenBasedHttp_1.ClientTokenBasedHttp({ baseURL: "http://localhost:3000" });
    await client.login("test@test.com", "password");
    await sleep(1100); //wait for token to expire
    //@ts-ignore - mock.method is valid
    node_test_1.mock.method(global, "fetch", async (url, config) => {
        if (url.endsWith("/refresh-token")) {
            refreshCalled = true;
            const access_token = jsonwebtoken_1.default.sign({ foo: "bar" }, "secret", { expiresIn: "1s" });
            const refresh_token = jsonwebtoken_1.default.sign({ foo: "bar" }, "secret", { expiresIn: "7d" });
            return new Response(JSON.stringify({ access_token, refresh_token }));
        }
        return new Response(JSON.stringify({ data: "success" }));
    });
    await client.get("/test");
    node_assert_1.default.equal(refreshCalled, true, "Should have called refresh token endpoint");
    node_assert_1.default.ok(client.refreshToken, "Should have stored refresh token");
});
(0, node_test_1.test)("should attempt refresh token on 401 response", async () => {
    const client = new ClientTokenBasedHttp_1.ClientTokenBasedHttp({ baseURL: "http://localhost:3000" });
    let refreshAttempted = false;
    let requestAttempts = 0;
    await client.login("test@test.com", "password");
    node_assert_1.default.ok(client.refreshToken, "Should have received refresh token on login");
    //@ts-ignore - mock.method is valid
    node_test_1.mock.method(global, "fetch", async (url, config) => {
        if (url.endsWith("/test")) {
            requestAttempts++;
            //first attempt returns 401
            if (requestAttempts === 1) {
                return new Response(null, { status: 401 });
            }
            //second attempt after refresh should succeed
            return new Response(JSON.stringify({ data: "success" }));
        }
        if (url.endsWith("/refresh-token")) {
            refreshAttempted = true;
            const headers = config.headers;
            node_assert_1.default.ok(headers?.['Authorization']?.includes(client.refreshToken), "Should send refresh token in Authorization header");
            const access_token = jsonwebtoken_1.default.sign({ foo: "bar" }, "secret", { expiresIn: "1s" });
            const refresh_token = jsonwebtoken_1.default.sign({ foo: "bar" }, "secret", { expiresIn: "7d" });
            return new Response(JSON.stringify({ access_token, refresh_token }));
        }
    });
    await client.get("/test");
    node_assert_1.default.equal(refreshAttempted, true, "Should have attempted token refresh");
    node_assert_1.default.equal(requestAttempts, 2, "Should have attempted the request twice");
});
(0, node_test_1.test)("should clear tokens when refresh token fails", async () => {
    const client = new ClientTokenBasedHttp_1.ClientTokenBasedHttp({ baseURL: "http://localhost:3000" });
    await client.login("test@test.com", "password");
    node_assert_1.default.ok(client.accessToken, "Should have access token");
    node_assert_1.default.ok(client.refreshToken, "Should have refresh token");
    //@ts-ignore - mock.method is valid
    node_test_1.mock.method(global, "fetch", async (url) => {
        if (url.endsWith("/refresh-token")) {
            return new Response(null, { status: 401 });
        }
        return new Response(null, { status: 401 });
    });
    try {
        await client.get("/test");
        node_assert_1.default.fail("Should throw error");
    }
    catch (error) {
        node_assert_1.default.equal(client.accessToken, null, "Should clear access token");
        node_assert_1.default.equal(client.refreshToken, null, "Should clear refresh token");
    }
});
