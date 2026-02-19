import { prisma } from "@/lib/prisma";
import BookingForm from "@/components/BookingForm";
import { cookies } from "next/headers";
import { Info } from "lucide-react";

async function getInitialData() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  // 1. 유저 정보 조회
  let user = null;
  if (userId) {
    user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, name: true, discordId: true },
    });
  }

  // 2. 미래의 모든 예약 조회 (가용성 맵 생성)
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const allReservations = await prisma.reservation.findMany({
    where: {
      date: {
        gte: todayStr,
      },
    },
    select: {
      date: true,
      timeSlot: true,
    },
  });

  const availabilityMap: Record<string, string[]> = {};
  allReservations.forEach((r) => {
    if (!availabilityMap[r.date]) {
      availabilityMap[r.date] = [];
    }
    availabilityMap[r.date].push(r.timeSlot);
  });

  // 3. 내 예약 목록 조회 (로그인 시)
  let myReservations: any[] = [];
  if (userId) {
    myReservations = await prisma.reservation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  return {
    user,
    availabilityMap,
    myReservations,
  };
}

export default async function Home() {
  const { user, availabilityMap, myReservations } = await getInitialData();

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#f8fafc", paddingBottom: "80px" }}>
      <BookingForm
        initialAvailability={availabilityMap}
        initialUser={user}
        initialReservations={myReservations}
      />
    </main>
  );
}

