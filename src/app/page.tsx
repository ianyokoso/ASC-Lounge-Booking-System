"use client";

import { useState, useEffect } from "react";
import Calendar from "@/components/Calendar";
import TimeSelector from "@/components/TimeSelector";
import AuthModal from "@/components/AuthModal";
import { AlertCircle, Calendar as CalendarIcon, Info, Rocket, Loader2 } from "lucide-react";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchReservations = async () => {
    try {
      const res = await fetch("/api/reservations");
      const data = await res.json();
      setReservations(data);
    } catch (err) {
      console.error("Fetch reservations failed");
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const disabledSlots = reservations
    .filter((r) => r.date === selectedDate && r.status === "CONFIRMED")
    .map((r) => r.timeSlot);

  const handleReservation = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!selectedDate || !selectedSlot) {
      setError("날짜와 시간을 선택해주세요.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, timeSlot: selectedSlot }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "예약 실패");
      }

      setSuccess("라운지 예약이 확정되었습니다!");
      setSelectedSlot("");
      fetchReservations();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <header className="heading-container">
        <h1>라운지 예약하기</h1>
        <p>원하는 날짜와 시간을 선택해주세요</p>
      </header>

      <div className="card grid-container">
        <div className="calendar-section">
          <div className="section-title">
            <CalendarIcon size={18} />
            <h4>날짜 선택</h4>
          </div>
          <Calendar
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setSelectedSlot("");
            }}
          />
        </div>

        <div className="time-section">
          <TimeSelector
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
            disabledSlots={disabledSlots}
          />

          <div className="selection-info">
            {selectedDate && (
              <div className="info-box">
                <div className="info-label">선택된 날짜</div>
                <div className="info-value">{selectedDate}</div>
                <div className="info-sub">저녁 7시부터 이용 가능</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rules-card">
        <div className="rules-header">
          <Rocket size={18} className="rocket-icon" />
          <h4>🚀 예약 안내</h4>
        </div>
        <ul>
          <li>새로운 정책: 예약은 3시간 단위로 가능합니다</li>
          <li>권장사항: 다른 회원들을 위해 일주일에 한 번 정도 이용을 권장합니다</li>
          <li>평일은 저녁 7시부터, 주말은 제한이 없습니다</li>
          <li>1인당 하루 최대 3시간까지 예약 가능합니다</li>
          <li>예약 취소는 이용 1시간 전까지 가능합니다</li>
          <li>예약 완료 시 즉시 확정됩니다</li>
        </ul>
      </div>

      <div className="action-area">
        {error && <div className="alert alert-error"><AlertCircle size={16} /> {error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="btn-group">
          <button
            className="btn-primary reservation-btn"
            disabled={!selectedDate || !selectedSlot || loading}
            onClick={handleReservation}
          >
            {loading ? <Loader2 className="animate-spin" /> : "예약 확정"}
          </button>
          <button className="btn-outline" onClick={() => {
            setSelectedDate("");
            setSelectedSlot("");
            setError("");
            setSuccess("");
          }}>
            초기화
          </button>
        </div>
      </div>

      {user && (
        <>
          {/* My Reservations Section */}
          {reservations.filter(r => r.userId === user?.id).length > 0 && (
            <div className="my-reservations fade-in">
              <h3 className="section-header">📅 내 예약 현황</h3>
              <div className="reservation-list">
                {reservations
                  .filter(r => r.userId === user?.id)
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((r) => (
                    <div key={r.id} className="reservation-item">
                      <div className="res-info">
                        <span className="res-date">{r.date}</span>
                        <span className="res-time">{r.timeSlot}</span>
                      </div>
                      <button
                        className="btn-cancel"
                        onClick={async () => {
                          if (!confirm("정말 예약을 취소하시겠습니까?")) return;
                          try {
                            const res = await fetch("/api/reservations", {
                              method: "DELETE",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: r.id }),
                            });
                            if (!res.ok) {
                              const data = await res.json();
                              throw new Error(data.error || "취소 실패");
                            }
                            setSuccess("예약이 취소되었습니다.");
                            fetchReservations();
                          } catch (err: any) {
                            setError(err.message);
                          }
                        }}
                      >
                        취소
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="user-status">
            접속 중: <strong>{user.name || user.username}</strong>님 (임시 로그인)
            <button className="btn-logout" onClick={() => setUser(null)}>로그아웃</button>
          </div>
        </>
      )}

      {showAuthModal && (
        <AuthModal
          onSuccess={(u) => {
            setUser(u);
            setShowAuthModal(false);
          }}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      <style jsx>{`
        .grid-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          margin-bottom: 24px;
        }

        @media (max-width: 768px) {
          .grid-container {
            grid-template-columns: 1fr;
          }
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          color: var(--text-main);
        }

        .section-title h4 {
          font-size: 16px;
          font-weight: 600;
        }

        .selection-info {
          margin-top: 24px;
        }

        .info-box {
          background: #f8fafc;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 16px;
          text-align: center;
        }

        .info-label {
          font-size: 12px;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .info-value {
          font-size: 18px;
          font-weight: 700;
          color: var(--primary);
        }

        .info-sub {
          font-size: 12px;
          color: #64748b;
          margin-top: 4px;
        }

        .rules-card {
          background: #fff;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 24px;
          margin-bottom: 32px;
        }

        .rules-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          color: #1e293b;
        }

        .rules-header h4 {
          font-weight: 700;
        }

        .rules-card ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .rules-card li {
          font-size: 14px;
          color: #475569;
          margin-bottom: 8px;
          padding-left: 20px;
          position: relative;
        }

        .rules-card li::before {
          content: "•";
          position: absolute;
          left: 0;
          color: var(--primary);
          font-weight: bold;
        }

        .action-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          margin-bottom: 40px;
        }

        .btn-group {
          display: flex;
          gap: 12px;
          width: 100%;
          max-width: 400px;
        }

        .reservation-btn {
          flex: 2;
          height: 48px;
          font-size: 16px;
          font-weight: 600;
        }

        .btn-outline {
          flex: 1;
          height: 48px;
          background: white;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-muted);
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-outline:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: var(--text-main);
        }

        .user-status {
          margin-top: 24px;
          padding: 12px;
          background: #f8fafc;
          border-radius: var(--radius-md);
          font-size: 13px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .btn-logout {
          background: none;
          border: none;
          color: #ef4444;
          font-size: 12px;
          text-decoration: underline;
          cursor: pointer;
          padding: 0;
        }

        .my-reservations {
          margin-top: 40px;
          padding-top: 32px;
          border-top: 1px solid var(--border-color);
          width: 100%;
        }

        .section-header {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 16px;
          color: var(--text-main);
        }

        .reservation-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
        }

        .reservation-item {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .reservation-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .res-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .res-date {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-main);
        }

        .res-time {
          font-size: 13px;
          color: var(--primary);
          font-weight: 500;
        }

        .btn-cancel {
          background: #fee2e2;
          color: #ef4444;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-cancel:hover {
          background: #fecaca;
        }
      `}</style>
    </main>
  );
}
