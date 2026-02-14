import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: 예약된 시간대 목록 조회 (단일 날짜 또는 전체 범위)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const date = searchParams.get("date");
        const month = searchParams.get("month"); // YYYY-MM 형식 지원 가능

        // 1. 단일 날짜 조회 (호환성 유지)
        if (date) {
            const reservations = await prisma.reservation.findMany({
                where: {
                    date: date,
                },
                select: {
                    timeSlot: true,
                },
            });
            const timeSlots = reservations.map((r) => r.timeSlot);
            return NextResponse.json({ timeSlots });
        }

        // 2. 전체(또는 월별) 범위 조회 - 성능 최적화용
        // 기본적으로 오늘 이후의 모든 예약을 가져옴
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

        const reservations = await prisma.reservation.findMany({
            where: {
                date: {
                    gte: todayStr
                }
            },
            select: {
                date: true,
                timeSlot: true,
            },
        });

        // 날짜별로 그룹화
        // { "2024-03-01": ["19:00-22:00"], "2024-03-02": [...] }
        const availabilityMap: Record<string, string[]> = {};

        reservations.forEach(r => {
            if (!availabilityMap[r.date]) {
                availabilityMap[r.date] = [];
            }
            availabilityMap[r.date].push(r.timeSlot);
        });

        return NextResponse.json({ availabilityMap });

    } catch (error: any) {
        console.error("예약 현황 조회 오류:", error);
        return NextResponse.json(
            { error: "예약 현황을 불러오는 중 오류가 발생했습니다" },
            { status: 500 }
        );
    }
}
