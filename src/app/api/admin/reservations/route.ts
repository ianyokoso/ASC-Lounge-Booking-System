import { NextResponse } from "next/server";
import { db } from "@/db";
import { reservations } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID가 필요합니다" }, { status: 400 });
        }

        // TODO: Add admin authentication check here

        await db.delete(reservations).where(eq(reservations.id, id));

        return NextResponse.json({ message: "삭제되었습니다" });
    } catch (error) {
        return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
    }
}
