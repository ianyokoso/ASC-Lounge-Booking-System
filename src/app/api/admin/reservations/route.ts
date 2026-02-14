import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: 모든 예약 목록 조회 (관리자용)
export async function GET(req: Request) {
    try {
        // TODO: 관리자 인증 로직 추가 필요

        const reservations = await prisma.reservation.findMany({
            include: {
                user: {
                    select: {
                        username: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                date: "desc",
            },
        });

        return NextResponse.json({ reservations });
    } catch (error: any) {
        console.error("관리자 예약 조회 오류:", error);
        return NextResponse.json(
            { error: "예약 목록을 불러오는 중 오류가 발생했습니다" },
            { status: 500 }
        );
    }
}

// DELETE: 예약 강제 삭제 (관리자용)
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID가 필요합니다" }, { status: 400 });
        }

        // TODO: 관리자 인증 로직 추가 필요

        await prisma.reservation.delete({
            where: { id },
        });

        return NextResponse.json({ message: "삭제되었습니다" });
    } catch (error: any) {
        console.error("관리자 예약 삭제 오류:", error);
        return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
    }
}
