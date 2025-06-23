import jwt from "jsonwebtoken";
import { createDatabaseConnection } from "./database";
import { loadFixtures } from "./fixtures";

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