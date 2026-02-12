import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID가 필요합니다" }, { status: 400 });
        }

        // TODO: Add admin authentication check here
        // For now, we assume this route is protected by middleware or obscure URL
        // In a real app, verify session_user_id is an admin

        await prisma.reservation.delete({
            where: { id },
        });

        return NextResponse.json({ message: "삭제되었습니다" });
    } catch (error) {
        return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
    }
}
