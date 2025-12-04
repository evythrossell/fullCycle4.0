"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logRequest = logRequest;
exports.logResponse = logResponse;
function logRequest(req, res, next) {
    console.log(`request - [${new Date().toISOString().split('.')[0]}] ${req.method} ${req.url}`);
    next();
}
function logResponse(req, res, next) {
    res.on("finish", () => {
        console.log(`response - [${new Date().toISOString().split('.')[0]}] ${req.method} ${req.url} ${res.statusCode} ${res.statusMessage}`);
    });
    next();
}
