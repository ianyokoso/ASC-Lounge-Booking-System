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
    <main className="container">
      <header className="heading-container">
        <h1>라운지 예약하기</h1>
        <p>원하는 날짜와 시간을 선택해주세요</p>
      </header>

      <BookingForm
        initialAvailability={availabilityMap}
        initialUser={user}
        initialReservations={myReservations}
      />

      <div className="card guide-card">
        <div className="section-title">
          <Info size={18} />
          <h4>예약 안내</h4>
        </div>
        <ul className="guide-list">
          <li>
            <strong>새로운 정책:</strong> 예약은 3시간 단위로 가능합니다
          </li>
          <li>
            <strong>권장사항:</strong> 다른 회원들을 위해 일주일에 한 번 정도 이용을 권장합니다
          </li>
          <li>평일은 저녁 7시부터, 주말은 제한 없이 이용 가능합니다</li>
          <li>1인당 하루 최대 3시간까지 예약 가능합니다</li>
          <li>예약 취소는 이용 1시간 전까지 가능합니다</li>
          <li>예약 완료 시 즉시 확정되며 디스코드 DM으로 알림이 발송됩니다</li>
        </ul>
      </div>

      <style jsx>{`
        .guide-card {
          background: #fffdf2;
          border-color: #fef3c7;
        }
        .guide-list {
          list-style: none;
          padding: 0;
          margin-top: 16px;
        }
        .guide-list li {
          font-size: 14px;
          color: #92400e;
          margin-bottom: 12px;
          padding-left: 20px;
          position: relative;
          line-height: 1.6;
        }
        .guide-list li::before {
          content: "•";
          position: absolute;
          left: 0;
          font-weight: bold;
        }
      `}</style>
    </main>
  );
}

