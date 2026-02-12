import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { username, password, name } = await req.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: "사용자명과 비밀번호는 필수입니다" },
                { status: 400 }
            );
        }

        // 중복 사용자 확인
        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "이미 존재하는 사용자명입니다" },
                { status: 400 }
            );
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);

        // 사용자 생성
        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                name,
            },
        });

        return NextResponse.json(
            { message: "회원가입 성공", userId: newUser.id },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("회원가입 오류:", error);
        return NextResponse.json(
            { error: "회원가입 중 오류가 발생했습니다" },
            { status: 500 }
        );
    }
}
