import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";
import GangnamBookingPage from "./GangnamBookingPage";

const getCachedGangnamReservations = unstable_cache(
  async () => {
    const reservations = await prisma.gangnamReservation.findMany({
      where: { status: { in: ["PENDING", "CONFIRMED"] } },
      orderBy: { createdAt: "asc" },
    });
    return reservations;
  },
  ["gangnam-reservations"],
  { revalidate: 60, tags: ["gangnam-reservations"] }
);

async function getInitialData() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  const userPromise = userId
    ? prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, name: true, discordId: true, phoneNumber: true },
      })
    : Promise.resolve(null);

  const reservationsPromise = getCachedGangnamReservations();

  const [user, reservations] = await Promise.all([
    userPromise,
    reservationsPromise,
  ]);

  const availMap: Record<string, string[]> = {};
  reservations.forEach((r) => {
    if (!availMap[r.date]) availMap[r.date] = [];
    availMap[r.date].push(r.timeSlot);
  });

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
