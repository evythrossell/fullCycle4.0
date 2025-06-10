import express, { NextFunction } from "express";
import { logRequest, logResponse } from "./lib/log";
import { loadFixtures } from "./fixtures";
import { userRouter } from "./router/user-router";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(logRequest);
app.use(logResponse);

app.use(
    async(
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
){
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
res.status(500).json({ error: "Internal Server Error" });
}
