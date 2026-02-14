import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: 특정 날짜의 예약된 시간대 목록 조회
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const date = searchParams.get("date");

        if (!date) {
            return NextResponse.json(
                { error: "날짜가 필요합니다" },
                { status: 400 }
            );
        }

        const reservations = await prisma.reservation.findMany({
            where: {
                date: date,
                // status: "CONFIRMED" // 만약 status 필드 활용 시 추가
            },
            select: {
                timeSlot: true,
            },
        });

        const timeSlots = reservations.map((r) => r.timeSlot);

        return NextResponse.json({ timeSlots });
    } catch (error: any) {
        console.error("예약 현황 조회 오류:", error);
        return NextResponse.json(
            { error: "예약 현황을 불러오는 중 오류가 발생했습니다" },
            { status: 500 }
        );
    }
}
