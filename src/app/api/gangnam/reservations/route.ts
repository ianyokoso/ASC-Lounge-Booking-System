import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/solapi";
import { cookies } from "next/headers";

export async function GET(request: Request) {
    try {
        const reservations = await prisma.gangnamReservation.findMany({
            orderBy: { createdAt: "asc" }
        });
        return NextResponse.json(reservations);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        // Get userId from cookie
        const cookieStore = await cookies();
        const userId = cookieStore.get("userId")?.value;

        if (!userId) {
            return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
        }

        // Verify user exists and get profile info
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, username: true, name: true, discordId: true, phoneNumber: true },
        });

        if (!user) {
            return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 401 });
        }

        const body = await request.json();
        const { date, timeSlot } = body;

        const name = user.name || user.username;
        const discordNickname = user.discordId || "";
        const phoneNumber = user.phoneNumber || "";

        if (!date || !timeSlot) {
            return NextResponse.json({ error: "날짜와 시간을 선택해주세요." }, { status: 400 });
        }

        if (!discordNickname || !phoneNumber) {
            return NextResponse.json({ error: "프로필에 디스코드 닉네임과 전화번호가 등록되어 있지 않습니다." }, { status: 400 });
        }

        // Check if slot is already taken and confirmed
        const existing = await prisma.gangnamReservation.findFirst({
            where: {
                date,
                timeSlot,
                status: { in: ["PENDING", "CONFIRMED"] }
            }
        });

        if (existing) {
            return NextResponse.json({ error: "이미 예약된(또는 대기중인) 시간대입니다." }, { status: 400 });
        }

        const reservation = await prisma.gangnamReservation.create({
            data: {
                userId: user.id,
                date,
                timeSlot,
                name,
                discordNickname,
                phoneNumber,
                status: "PENDING"
            }
        });

        // Notify Manager via SMS
        const managerConfig = await prisma.siteConfig.findUnique({ where: { key: "GANGNAM_MANAGER_PHONE" } });
        if (managerConfig?.value) {
            const text = `[비타임 미팅룸(7인실) 예약 요청]\n이름: ${name}\n날짜: ${date}\n시간: ${timeSlot}\n연락처: ${phoneNumber}\n\n아래 페이지에서 승인 여부 확인 바랍니다.\nhttps://asc-lounge-booking-system.vercel.app/gangnam/admin`;
            await sendSms(managerConfig.value, text).catch(e => console.error("Manager SMS Error:", e));
        } else {
            console.warn("GANGNAM_MANAGER_PHONE not set in SiteConfig.");
        }

        return NextResponse.json(reservation, { status: 201 });
    } catch (error: any) {
        console.error("Gangnam Reservation POST Error:", error);
        return NextResponse.json({ error: "예약 처리 중 오류가 발생했습니다." }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("userId")?.value;

        if (!userId) {
            return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
        }

        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: "예약 ID가 필요합니다." }, { status: 400 });
        }

        const reservation = await prisma.gangnamReservation.findUnique({
            where: { id },
        });

        if (!reservation) {
            return NextResponse.json({ error: "예약을 찾을 수 없습니다." }, { status: 404 });
        }

        if (reservation.userId !== userId) {
            return NextResponse.json({ error: "예약을 취소할 권한이 없습니다." }, { status: 403 });
        }

        await prisma.gangnamReservation.update({
            where: { id },
            data: { status: "CANCELLED", cancelledBy: "USER" },
        });

        // 매니저에게 취소 SMS 알림
        const managerConfig = await prisma.siteConfig.findUnique({ where: { key: "GANGNAM_MANAGER_PHONE" } });
        if (managerConfig?.value) {
            const text = `[비타임 미팅룸(7인실) 예약 취소]\n이름: ${reservation.name}\n날짜: ${reservation.date}\n시간: ${reservation.timeSlot}\n연락처: ${reservation.phoneNumber}`;
            await sendSms(managerConfig.value, text).catch(e => console.error("Manager Cancel SMS Error:", e));
        }

        return NextResponse.json({ message: "예약이 취소되었습니다." });
    } catch (error: any) {
        console.error("Gangnam Reservation DELETE Error:", error);
        return NextResponse.json({ error: "예약 취소 중 오류가 발생했습니다." }, { status: 500 });
    }
}
