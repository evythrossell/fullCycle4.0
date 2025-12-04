"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_session_1 = __importDefault(require("express-session"));
const log_1 = require("../lib/log");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ClientTokenBasedHttp_1 = require("../lib/ClientTokenBasedHttp");
dotenv_1.default.config();
exports.app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.urlencoded({ extended: true }));
//using session
exports.app.use((0, express_session_1.default)({
    name: "auth-session",
    secret: process.env.SESSION_SECRET || "defaultSecret",
    resave: false,
    //saveUninitialized - it saves the session even if it hasn't been modified
    saveUninitialized: false,
    //rolling - updates the cookie with each request
    rolling: true,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        //7 days
        maxAge: 1000 * 60 * 60 * 24 * 7,
        //strict - it only sends the cookie if the request is on the same domain
        sameSite: "strict",
    },
}));
//log requests
exports.app.use(log_1.logRequest);
//log responses headers
exports.app.use(log_1.logResponse);
const protectedRoutes = ["/protected"];
exports.app.use(async (req, res, next) => {
    const isProtectedRoute = protectedRoutes.some((route) => req.url.startsWith(route));
    if (!isProtectedRoute) {
        return next();
    }
    if (!req.session.access_token || !req.session.refresh_token) {
        return res.redirect("/logout");
    }
    const token = req.session.access_token;
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_PUBLIC_KEY, {
            algorithms: ["RS256"],
        });
        req.user = payload;
        next();
    }
    catch (error) {
        console.error(error);
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            const authClient = new ClientTokenBasedHttp_1.ClientTokenBasedHttp({
                baseURL: "http://localhost:3000",
                accessToken: req.session.access_token,
                refreshToken: req.session.refresh_token,
            });
            await authClient.doRefreshToken();
            req.session.access_token = authClient.accessToken;
            req.session.refresh_token = authClient.refreshToken;
            const payload = jsonwebtoken_1.default.decode(authClient.accessToken);
            req.user = payload;
            req.session.save((error) => {
                if (error) {
                    console.error(error);
                    res.redirect("/logout");
                    return;
                }
                next();
            });
            return;
        }
        res.redirect("/logout");
    }
});
exports.app.get("/login", async (req, res) => {
    res.send(`
    <h1>Login Session Cookie</h1>
    <form action="/login" method="post">
      <input type="email" name="email" value="admin@user.com"  />
      <input type="password" name="password" value="admin" />
      <button type="submit">Login</button>
    </form>
  `);
});
exports.app.post("/login", async (req, res) => {
    const http = new ClientTokenBasedHttp_1.ClientTokenBasedHttp({
        baseURL: "http://localhost:3000",
    });
    const data = await http.post("/login", {
        email: req.body.email,
        password: req.body.password,
    }, {}, false);
    //const payload = jwt.decode()
    //req.session.user = payload;
    req.session.access_token = data.access_token;
    req.session.refresh_token = data.refresh_token;
    req.session.save((error) => {
        if (error) {
            console.error(error);
            return;
        }
        res.redirect("/protected");
    });
});
exports.app.get("/protected", async (req, res) => {
    const http = new ClientTokenBasedHttp_1.ClientTokenBasedHttp({
        baseURL: "http://localhost:3000",
        accessToken: req.session.access_token,
        refreshToken: req.session.refresh_token,
    });
    const data = await http.get("/protectd", {}, true);
    console.log(data);
    res.send({ message: req.user.name });
});
exports.app.get("/logout", async (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error(error);
            return;
        }
        res.redirect("/login");
    });
    res.clearCookie("auth-session");
});
exports.app.listen(PORT, async () => {
    console.log(`Server is running on port on http://localhost:${PORT}`);
});
