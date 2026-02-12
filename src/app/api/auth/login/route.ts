import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: "사용자명과 비밀번호는 필수입니다" },
                { status: 400 }
            );
        }

        // 사용자 조회
        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            return NextResponse.json(
                { error: "사용자를 찾을 수 없습니다" },
                { status: 404 }
            );
        }

        // 비밀번호 확인
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "비밀번호가 일치하지 않습니다" },
                { status: 401 }
            );
        }

        // 쿠키 설정
        const cookieStore = await cookies();
        cookieStore.set("userId", user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7일
        });

        return NextResponse.json({
            message: "로그인 성공",
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
            },
        });
    } catch (error: any) {
        console.error("로그인 오류:", error);
        return NextResponse.json(
            { error: "로그인 중 오류가 발생했습니다" },
            { status: 500 }
        );
    }
}
