"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
exports.createUserService = createUserService;
const database_1 = require("../database");
class UserService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async findAll() {
        return this.userRepository.find();
    }
    async findById(id) {
        return this.userRepository.findOne({ where: { id } });
    }
    async findByEmail(email) {
        return this.userRepository.findOne({ where: { email } });
    }
    async create(data) {
        const user = this.userRepository.create(data);
        return this.userRepository.save(user);
    }
    async update(id, data) {
        const user = await this.findById(id);
        if (!user)
            return null;
        if (data.name)
            user.name = data.name;
        if (data.email)
            user.email = data.email;
        if (data.password)
            user.password = data.password;
        return this.userRepository.save(user);
    }
    async delete(id) {
        await this.userRepository.delete(id);
    }
}
exports.UserService = UserService;
async function createUserService() {
    const { userRepository } = await (0, database_1.createDatabaseConnection)();
    return new UserService(userRepository);
}
