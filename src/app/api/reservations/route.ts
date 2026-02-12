import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// GET: 예약 조회
export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("userId")?.value;

        if (!userId) {
            return NextResponse.json(
                { error: "로그인이 필요합니다" },
                { status: 401 }
            );
        }

        const reservations = await prisma.reservation.findMany({
            where: { userId },
            include: {
                user: {
                    select: {
                        username: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({ reservations });
    } catch (error: any) {
        console.error("예약 조회 오류:", error);
        return NextResponse.json(
            { error: "예약 조회 중 오류가 발생했습니다" },
            { status: 500 }
        );
    }
}

// POST: 예약 생성
export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("userId")?.value;

        if (!userId) {
            return NextResponse.json(
                { error: "로그인이 필요합니다" },
                { status: 401 }
            );
        }

        const { date, timeSlot, name, discordId } = await req.json();

        if (!date || !timeSlot) {
            return NextResponse.json(
                { error: "날짜와 시간은 필수입니다" },
                { status: 400 }
            );
        }

        // 사용자 정보 업데이트 (이름 및 Discord ID)
        if (name || discordId) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    ...(name && { name }),
                    ...(discordId && { discordId }),
                },
            });
        }

        // 중복 예약 확인
        const existingReservation = await prisma.reservation.findFirst({
            where: {
                date,
                timeSlot,
            },
        });

        if (existingReservation) {
            return NextResponse.json(
                { error: "해당 시간대는 이미 예약되었습니다" },
                { status: 400 }
            );
        }

        // 예약 생성
        const newReservation = await prisma.reservation.create({
            data: {
                userId,
                date,
                timeSlot,
            },
            include: {
                user: {
                    select: {
                        username: true,
                        name: true,
                        discordId: true,
                    },
                },
            },
        });

        return NextResponse.json(
            { message: "예약 성공", reservation: newReservation },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("예약 생성 오류:", error);
        return NextResponse.json(
            { error: "예약 생성 중 오류가 발생했습니다" },
            { status: 500 }
        );
    }
}

// DELETE: 예약 취소
export async function DELETE(req: Request) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("userId")?.value;

        if (!userId) {
            return NextResponse.json(
                { error: "로그인이 필요합니다" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const reservationId = searchParams.get("id");

        if (!reservationId) {
            return NextResponse.json(
                { error: "예약 ID가 필요합니다" },
                { status: 400 }
            );
        }

        // 예약 확인 및 권한 검증
        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
        });

        if (!reservation) {
            return NextResponse.json(
                { error: "예약을 찾을 수 없습니다" },
                { status: 404 }
            );
        }

        if (reservation.userId !== userId) {
            return NextResponse.json(
                { error: "예약을 취소할 권한이 없습니다" },
                { status: 403 }
            );
        }

        // 예약 삭제
        await prisma.reservation.delete({
            where: { id: reservationId },
        });

        return NextResponse.json({ message: "예약이 취소되었습니다" });
    } catch (error: any) {
        console.error("예약 취소 오류:", error);
        return NextResponse.json(
            { error: "예약 취소 중 오류가 발생했습니다" },
            { status: 500 }
        );
    }
}
