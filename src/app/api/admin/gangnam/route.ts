import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/solapi";

export async function GET() {
    try {
        const reservations = await prisma.gangnamReservation.findMany({
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json(reservations);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, status } = body;

        if (!id || !["CONFIRMED", "REJECTED"].includes(status)) {
            return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
        }

        const reservation = await prisma.gangnamReservation.update({
            where: { id },
            data: { status }
        });

        // Notify User via SMS
        if (reservation.phoneNumber) {
            const statusText = status === "CONFIRMED" ? "승인" : "불가(거절)";
            const text = `[ASC 강남 라운지 안내]\n${reservation.name}님의 예약이 ${statusText} 처리되었습니다.\n예약 일시: ${reservation.date} ${reservation.timeSlot}`;

            await sendSms(reservation.phoneNumber, text).catch(e => console.error("User SMS Error:", e));
        }

        return NextResponse.json(reservation);
    } catch (error: any) {
        console.error("Admin Gangnam PATCH Error:", error);
        return NextResponse.json({ error: "상태 변경 중 오류가 발생했습니다." }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: "예약 ID가 필요합니다." }, { status: 400 });
        }

        const reservation = await prisma.gangnamReservation.findUnique({ where: { id } });

        if (!reservation) {
            return NextResponse.json({ error: "예약을 찾을 수 없습니다." }, { status: 404 });
        }

        await prisma.gangnamReservation.delete({ where: { id } });

        // 예약자에게 취소 SMS 알림
        if (reservation.phoneNumber) {
            const text = `[ASC 강남 라운지 안내]\n${reservation.name}님의 ${reservation.date} ${reservation.timeSlot} 예약이 관리자에 의해 취소되었습니다.`;
            await sendSms(reservation.phoneNumber, text).catch(e => console.error("Admin Cancel SMS Error:", e));
        }

        return NextResponse.json({ message: "예약이 취소되었습니다." });
    } catch (error: any) {
        console.error("Admin Gangnam DELETE Error:", error);
        return NextResponse.json({ error: "예약 삭제 중 오류가 발생했습니다." }, { status: 500 });
    }
}
