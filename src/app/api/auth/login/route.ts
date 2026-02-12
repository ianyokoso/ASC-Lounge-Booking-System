import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            return NextResponse.json(
                { error: "사용자를 찾을 수 없거나 비밀번호가 틀렸습니다." },
                { status: 401 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "사용자를 찾을 수 없거나 비밀번호가 틀렸습니다." },
                { status: 401 }
            );
        }

        // 간단한 세션 처리 (실제 프로젝트에서는 JWT 등을 권장하나 여기서는 단순 아이디 쿠키로 처리)
        (await cookies()).set("session_user_id", user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 1주일
            path: "/",
        });

        return NextResponse.json({
            message: "로그인 성공",
            user: { id: user.id, username: user.username, name: user.name },
        });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "서버 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}
