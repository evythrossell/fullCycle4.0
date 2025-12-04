"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const UserService_1 = require("../services/UserService");
const userRouter = (0, express_1.Router)();
exports.userRouter = userRouter;
userRouter.get("/users/:id", async (req, res, next) => {
    try {
        const userService = await (0, UserService_1.createUserService)();
        const id = parseInt(req.params.id);
        const user = await userService.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.json(user);
    }
    catch (error) {
        next(error);
    }
});
userRouter.post("/users", async (req, res, next) => {
    try {
        const userService = await (0, UserService_1.createUserService)();
        const { name, email, password } = req.body;
        const user = await userService.create({ name, email, password });
        return res.status(201).json(user);
    }
    catch (error) {
        next(error);
    }
});
userRouter.patch("/users/:id", async (req, res, next) => {
    try {
        const userService = await (0, UserService_1.createUserService)();
        const id = parseInt(req.params.id);
        const { name, email, password } = req.body;
        const user = await userService.update(id, { name, email, password });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.json(user);
    }
    catch (error) {
        next(error);
    }
});
userRouter.delete("/users/:id", async (req, res, next) => {
    try {
        const userService = await (0, UserService_1.createUserService)();
        const id = parseInt(req.params.id);
        const user = await userService.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        await userService.delete(id);
        return res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
