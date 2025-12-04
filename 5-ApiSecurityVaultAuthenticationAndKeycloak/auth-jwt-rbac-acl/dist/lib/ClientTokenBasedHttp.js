"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientTokenBasedHttp = void 0;
class ClientTokenBasedHttp {
    accessToken = null;
    refreshToken = null;
    baseURL;
    constructor(options) {
        this.baseURL = options.baseURL;
        this.accessToken = options.accessToken || null;
        this.refreshToken = options.refreshToken || null;
    }
    async login(email, password) {
        const response = await fetch(`${this.baseURL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
            throw new Error('Login failed');
        }
        const tokens = await response.json();
        this.accessToken = tokens.access_token;
        this.refreshToken = tokens.refresh_token;
        return tokens;
    }
    static isTokenExpiring(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = payload.exp * 1000; //convert to milliseconds
            const currentTime = Date.now();
            const timeUntilExpiration = expirationTime - currentTime;
            //return true if token will expire in less than 30 seconds
            return timeUntilExpiration <= 30000;
        }
        catch {
            return true;
        }
    }
    async doRefreshToken() {
        if (!this.refreshToken) {
            throw new Error('No refresh token available');
        }
        const response = await fetch(`${this.baseURL}/refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.refreshToken}`,
            },
        });
        if (!response.ok) {
            this.clearToken();
            throw new Error('Failed to refresh token');
        }
        const tokens = await response.json();
        this.accessToken = tokens.access_token;
        this.refreshToken = tokens.refresh_token;
        return tokens;
    }
    async makeRequest(path, config = {}, requiresAuth = true) {
        if (requiresAuth) {
            if (!this.accessToken) {
                throw new Error('No access token available');
            }
            if (ClientTokenBasedHttp.isTokenExpiring(this.accessToken)) {
                await this.doRefreshToken();
            }
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${this.accessToken}`,
            };
        }
        const response = await fetch(`${this.baseURL}${path}`, config);
        if (response.status === 401 && requiresAuth) { //token expired
            try {
                await this.doRefreshToken();
                config.headers = {
                    ...config.headers,
                    Authorization: `Bearer ${this.accessToken}`,
                };
                const retryResponse = await fetch(`${this.baseURL}${path}`, config);
                if (!retryResponse.ok) {
                    throw new Error('Request failed after token refresh');
                }
                return retryResponse.json();
            }
            catch (error) {
                throw new Error('Authentication failed');
            }
        }
        if (!response.ok) {
            throw new Error('Request failed');
        }
        return response.json();
    }
    async request(path, config = {}, requiresAuth = true) {
        return this.makeRequest(path, config, requiresAuth);
    }
    async get(path, config = {}, requiresAuth = true) {
        return this.makeRequest(path, { ...config, method: 'GET' }, requiresAuth);
    }
    async post(path, data, config = {}, requiresAuth = true) {
        const conf = {
            ...config,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...config.headers,
            },
            body: JSON.stringify(data),
        };
        return this.makeRequest(path, conf, requiresAuth);
    }
    isAuthenticated() {
        return this.accessToken !== null;
    }
    clearToken() {
        this.accessToken = null;
        this.refreshToken = null;
    }
}
exports.ClientTokenBasedHttp = ClientTokenBasedHttp;
