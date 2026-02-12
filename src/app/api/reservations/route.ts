import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { sendDiscordNotification } from "@/lib/discord";

export async function GET() {
    try {
        const reservations = await prisma.reservation.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        username: true,
                    },
                },
            },
        });
        return NextResponse.json(reservations);
    } catch (error) {
        return NextResponse.json({ error: "조회 실패" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const userId = (await cookies()).get("session_user_id")?.value;
        if (!userId) {
            return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
        }

        const { date, timeSlot } = await req.json();

        // 하루 최대 3시간 제한 확인 (슬롯 하나가 3시간이므로 하루에 한 번만 예약 가능하다고 가정)
        const existingDayRegistration = await prisma.reservation.findFirst({
            where: {
                userId,
                date,
            },
        });

        if (existingDayRegistration) {
            return NextResponse.json(
                { error: "이미 해당 날짜에 예약이 있습니다. (하루 최대 3시간)" },
                { status: 400 }
            );
        }

        // 중복 슬롯 확인
        const slotTaken = await prisma.reservation.findUnique({
            where: {
                date_timeSlot: {
                    date,
                    timeSlot,
                },
            },
        });

        if (slotTaken) {
            return NextResponse.json(
                { error: "이미 예약된 시간대입니다." },
                { status: 400 }
            );
        }

        const reservation = await prisma.reservation.create({
            data: {
                userId,
                date,
                timeSlot,
            },
        });

        // 사용자 정보 조회 (알림용)
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const userName = user?.name || user?.username || "알 수 없음";

        // Discord 알림 전송
        await sendDiscordNotification(
            `📢 **새로운 예약 알림**\n- 예약자: ${userName}\n- 날짜: ${date}\n- 시간: ${timeSlot}`
        );

        return NextResponse.json(reservation, { status: 201 });
    } catch (error) {
        console.error("Reservation error:", error);
        return NextResponse.json({ error: "예약 실패" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const userId = (await cookies()).get("session_user_id")?.value;
        if (!userId) {
            return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
        }

        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "예약 ID가 필요합니다." }, { status: 400 });
        }

        // 본인의 예약인지 확인
        const reservation = await prisma.reservation.findUnique({
            where: { id },
        });

        if (!reservation) {
            return NextResponse.json({ error: "존재하지 않는 예약입니다." }, { status: 404 });
        }

        if (reservation.userId !== userId) {
            return NextResponse.json({ error: "취소 권한이 없습니다." }, { status: 403 });
        }

        await prisma.reservation.delete({
            where: { id },
        });

        return NextResponse.json({ message: "예약이 취소되었습니다." });
    } catch (error) {
        console.error("Cancellation error:", error);
        return NextResponse.json({ error: "취소 실패" }, { status: 500 });
    }
}
