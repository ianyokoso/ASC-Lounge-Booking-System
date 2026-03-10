import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const config = await prisma.siteConfig.findUnique({
            where: { key: "GANGNAM_MANAGER_PHONE" },
        });
        return NextResponse.json({ managerPhone: config?.value || "" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { managerPhone } = await request.json();

        if (!managerPhone) {
            return NextResponse.json({ error: "매니저 번호를 입력해주세요." }, { status: 400 });
        }

        const cleanPhone = managerPhone.replace(/[^0-9]/g, "");

        const config = await prisma.siteConfig.upsert({
            where: { key: "GANGNAM_MANAGER_PHONE" },
            update: { value: cleanPhone },
            create: { key: "GANGNAM_MANAGER_PHONE", value: cleanPhone },
        });

        return NextResponse.json({ managerPhone: config.value });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
