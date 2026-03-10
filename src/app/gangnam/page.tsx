import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import GangnamBookingPage from "./GangnamBookingPage";

async function getInitialData() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  const userPromise = userId
    ? prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, name: true, discordId: true, phoneNumber: true },
      })
    : Promise.resolve(null);

  const reservationsPromise = prisma.gangnamReservation.findMany({
    where: { status: { in: ["PENDING", "CONFIRMED"] } },
    orderBy: { createdAt: "asc" },
  });

  const [user, reservations] = await Promise.all([
    userPromise,
    reservationsPromise,
  ]);

  const availMap: Record<string, string[]> = {};
  reservations.forEach((r) => {
    if (!availMap[r.date]) availMap[r.date] = [];
    availMap[r.date].push(r.timeSlot);
  });

  // Get user's own gangnam reservations
  const myReservations = userId
    ? reservations.filter((r) => r.userId === userId)
    : [];

  return { user, availabilityMap: availMap, myReservations };
}

export default async function GangnamPage() {
  const { user, availabilityMap, myReservations } = await getInitialData();

  return (
    <GangnamBookingPage
      initialAvailability={availabilityMap}
      initialUser={user}
      initialReservations={myReservations}
    />
  );
}
