import jwt from "jsonwebtoken";
import { User } from "../entities/User";
import { InvalidCredentialsError } from "../errors";
import { Repository } from "typeorm";
import { createDatabaseConnection } from "../database";

export class AuthenticationService {
    constructor(private userRepository: Repository<User>) { }

    async login(email: string, password: string): Promise<string> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user || !user.comparePassword(password)) {
            throw new InvalidCredentialsError();
        }
        return AuthenticationService.generateAccessToken(user);
    }

    static generateAccessToken(user: User): string {
        return jwt.sign(
            { name: user.name, email: user.email },
            process.env.JWT_SECRET as string,
            {
                expiresIn: process.env.JWT_EXPIRES_IN as any,
            }
        )
    }

    static verifyAccessToken(token: string): {
        sub: string;
        name: string;
        email: string;
    } {
        return jwt.verify(token, process.env.JWT_SECRET as string) as {
            sub: string;
            name: string;
            email: string;
        };
    }
}

export async function createAuthenticationService(): Promise<AuthenticationService> {
    const { userRepository } = await createDatabaseConnection();
    return new AuthenticationService(userRepository);
}