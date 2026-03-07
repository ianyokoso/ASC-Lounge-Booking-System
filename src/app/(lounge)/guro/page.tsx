import { prisma } from "@/lib/prisma";
import BookingForm from "@/components/BookingForm";
import { cookies } from "next/headers";
import { cache } from "react";
import { unstable_cache } from "next/cache";

// 가용성 데이터 캐싱 (60초)
const getCachedAvailabilityMap = unstable_cache(
  async () => {
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
    allReservations.forEach((r: { date: string; timeSlot: string }) => {
      if (!availabilityMap[r.date]) {
        availabilityMap[r.date] = [];
      }
      availabilityMap[r.date].push(r.timeSlot);
    });
    return availabilityMap;
  },
  ["availability-map"],
  { revalidate: 60, tags: ["reservations"] }
);

async function getInitialData() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  // 병렬 쿼리 실행
  const userPromise = userId
    ? prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, name: true, discordId: true },
    })
    : Promise.resolve(null);

  const availabilityMapPromise = getCachedAvailabilityMap();

  const myReservationsPromise = userId
    ? prisma.reservation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10, // 초기 로딩용으로 최근 10개만 제한 (성능)
    })
    : Promise.resolve([]);

  const [user, availabilityMap, myReservations] = await Promise.all([
    userPromise,
    availabilityMapPromise,
    myReservationsPromise,
  ]);

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

