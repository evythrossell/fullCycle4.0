import jwt from "jsonwebtoken";
import { createDatabaseConnection } from "./auth-server/database";
import { loadFixtures } from "./auth-server/fixtures";

async function bootstrap() {
    await loadFixtures();

    const { userRepository } = await createDatabaseConnection();
    const user = await userRepository.findOneBy({
        email: "admin@user.com"
    });

    const token = jwt.sign({ name: user!.name, email: user!.email }, null, {
        expiresIn: "1m",
        subject: user!.id + "",
        algorithm: "none",
    });
    console.log(token);
}

bootstrap();