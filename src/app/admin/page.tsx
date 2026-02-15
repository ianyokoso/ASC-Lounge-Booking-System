import { prisma } from "@/lib/prisma";
import AdminManager from "@/components/AdminManager";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
    // Fetch all reservations on the server
    const reservations = await prisma.reservation.findMany({
        include: {
            user: {
                select: {
                    username: true,
                    name: true,
                },
            },
        },
        orderBy: {
            date: "desc",
        },
    });

    // Serialize data to avoid "Date object" warning (if any)
    const serializedReservations = JSON.parse(JSON.stringify(reservations));

    return <AdminManager initialReservations={serializedReservations} />;
}
