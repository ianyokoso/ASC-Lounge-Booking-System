import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    try {
        const cookieStore = await cookies();

        // userId 쿠키 삭제
        cookieStore.delete("userId");

        return NextResponse.json({ message: "로그아웃 성공" });
    } catch (error) {
        return NextResponse.json(
            { error: "로그아웃 중 오류가 발생했습니다" },
            { status: 500 }
        );
    }
}
