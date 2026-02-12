import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
    return new PrismaClient({
        // Prisma 7에서는 생성자에서 url을 명시적으로 넘겨주어야 합니다.
        // Accelerate를 쓰지 않더라도 accelerateUrl 필드를 통해 전달할 수 있습니다.
        accelerateUrl: process.env.DATABASE_URL,
    });
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
