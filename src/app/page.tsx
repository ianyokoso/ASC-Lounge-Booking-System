"use client";

import { useState, useEffect, useRef } from "react";
import Calendar from "@/components/Calendar";
import TimeSelector from "@/components/TimeSelector";
import AuthModal from "@/components/AuthModal";
import {
  AlertCircle,
  Calendar as CalendarIcon,
  User as UserIcon,
  Clock,
  CheckCircle2,
  Info,
  Layout,
  Loader2,
  Trash2,
  LogOut
} from "lucide-react";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [name, setName] = useState("");
  const [discordId, setDiscordId] = useState("");
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false);
  const availabilityCache = useRef<Record<string, string[]>>({});

  const fetchReservations = async () => {
    try {
      const res = await fetch("/api/reservations");
      const data = await res.json();
      if (Array.isArray(data.reservations)) {
        setReservations(data.reservations);
      } else {
        setReservations([]);
      }
    } catch (err) {
      setReservations([]);
    }
  };

  const fetchAvailability = async (date: string) => {
    if (!date) return;

    // 캐시 확인
    if (availabilityCache.current[date]) {
      setBookedSlots(availabilityCache.current[date]);
      return;
    }

    setIsAvailabilityLoading(true);
    setBookedSlots([]); // 로딩 중에는 선택 불가하도록 초기화 (또는 이전 상태 유지)

    try {
      const res = await fetch(`/api/availability?date=${date}`);
      const data = await res.json();
      if (data.timeSlots) {
        setBookedSlots(data.timeSlots);
        availabilityCache.current[date] = data.timeSlots; // 캐시 저장
      } else {
        setBookedSlots([]);
        availabilityCache.current[date] = [];
      }
    } catch (err) {
      console.error("Failed to fetch availability", err);
    } finally {
      setIsAvailabilityLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailability(selectedDate);
    } else {
      setBookedSlots([]);
    }
  }, [selectedDate, reservations]); // reservations 변경 시(내가 예약/취소 시)에도 반영

  useEffect(() => {
    if (user) {
      setName(user.name || user.username || "");
      setDiscordId(user.discordId || "");
    }
  }, [user]);

  const disabledSlots = bookedSlots;

  const isWeekend = (dateStr: string) => {
    if (!dateStr) return false;
    const day = new Date(dateStr).getDay();
    return day === 0 || day === 6;
  };

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
        body: JSON.stringify({
          date: selectedDate,
          timeSlot: selectedSlot,
          name: name,
          discordId: discordId
        }),
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

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <div>
            <strong>오류 발생:</strong> {error}
          </div>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle2 size={20} />
          <div>{success}</div>
        </div>
      )}

      <div className="card main-grid">
        <div className="section left-side">
          <div className="section-header-row">
            <div className="section-title">
              <CalendarIcon size={20} />
              <h4>날짜 선택</h4>
            </div>
            <button
              className="btn-today-header"
              onClick={() => {
                const today = new Date();
                const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
                setSelectedDate(dateStr);
              }}
            >
              오늘
            </button>
          </div>
          <Calendar
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setSelectedSlot("");
            }}
          />
          {selectedDate && (
            <div className="date-info-card">
              <div className="date-info-top">
                <div className="date-display-text">
                  선택된 날짜: <strong>{selectedDate} ({["일", "월", "화", "수", "목", "금", "토"][new Date(selectedDate).getDay()]})</strong>
                </div>
                <span className={`badge ${isWeekend(selectedDate) ? "badge-weekend" : "badge-weekday"}`}>
                  {isWeekend(selectedDate) ? "주말" : "평일"}
                </span>
              </div>
              <div className="date-sub-text">
                {isWeekend(selectedDate) ? "언제든 이용 가능" : "저녁 7시부터 이용 가능"}
              </div>
            </div>
          )}
        </div>

        <div className="section right-side">
          <TimeSelector
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
            disabledSlots={disabledSlots}
            isLoading={isAvailabilityLoading}
          />

          <div className="user-info-section">
            <div className="section-title">
              <UserIcon size={20} />
              <h4>예약자 정보</h4>
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="성함"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="premium-input"
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Discord ID (선택사항 - DM 알림용)"
                value={discordId}
                onChange={(e) => setDiscordId(e.target.value)}
                className="premium-input"
              />
              <p className="input-hint">💡 Discord ID는 선택사항입니다. 입력하면 예약 확정 시 DM으로 알림을 받을 수 있습니다.</p>
            </div>
          </div>

          <div className="summary-box">
            <div className="summary-title">● 예약 정보 확인</div>
            <div className="summary-content">
              <div className="summary-item">
                <div className="item-left"><CalendarIcon size={16} /> 날짜:</div>
                <div className="item-right">{selectedDate || "-"}</div>
              </div>
              <div className="summary-item">
                <div className="item-left"><Clock size={16} /> 시간:</div>
                <div className="item-right">{selectedSlot || "-"} (3시간)</div>
              </div>
              <div className="summary-item">
                <div className="item-left"><UserIcon size={16} /> 예약자:</div>
                <div className="item-right">{name || "-"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card guide-card">
        <div className="section-title">
          <Info size={18} />
          <h4>예약 안내</h4>
        </div>
        <ul className="guide-list">
          <li><strong>새로운 정책:</strong> 예약은 3시간 단위로 가능합니다</li>
          <li><strong>권장사항:</strong> 다른 회원들을 위해 일주일에 한 번 정도 이용을 권장합니다</li>
          <li>평일은 저녁 7시부터, 주말은 제한 없이 이용 가능합니다</li>
          <li>1인당 하루 최대 3시간까지 예약 가능합니다</li>
          <li>예약 취소는 이용 1시간 전까지 가능합니다</li>
          <li>예약 완료 시 즉시 확정되며 디스코드 DM으로 알림이 발송됩니다</li>
        </ul>
      </div>

      <div className="footer-actions">
        <button
          className="btn-primary confirm-btn"
          disabled={!selectedDate || !selectedSlot || loading}
          onClick={handleReservation}
        >
          {loading ? <Loader2 className="animate-spin" /> : "예약 확정"}
        </button>
        <button className="btn-outline reset-btn" onClick={() => {
          setSelectedDate("");
          setSelectedSlot("");
          setError("");
          setSuccess("");
        }}>
          초기화
        </button>
      </div>

      {user ? (
        <div className="my-status">
          <div className="user-profile">
            <Layout size={16} />
            접속 중: <strong>{user.username}</strong>
          </div>
          <button className="logout-link" onClick={() => {
            document.cookie = "session_user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
            window.location.reload();
          }}>
            <LogOut size={14} /> 로그아웃
          </button>
        </div>
      ) : (
        <div className="auth-footer">
          <button onClick={() => setShowAuthModal(true)} className="btn-outline">로그인 / 회원가입</button>
        </div>
      )}

      {/* User's Current Reservations List (Bottom) */}
      {user && reservations.filter(r => r.userId === user.id).length > 0 && (
        <div className="reservations-section">
          <h3 className="sub-header">내 예약 내역</h3>
          <div className="reservation-grid">
            {reservations
              .filter(r => r.userId === user.id)
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((r) => (
                <div key={r.id} className="res-card">
                  <div className="res-card-info">
                    <div className="res-card-date">{r.date}</div>
                    <div className="res-card-time">{r.timeSlot}</div>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={async () => {
                      if (!confirm("정말 취소하시겠습니까?")) return;
                      await fetch("/api/reservations", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: r.id })
                      });
                      fetchReservations();
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
          </div>
        </div>
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
        .main-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: start;
        }
        @media (max-width: 768px) {
          .main-grid {
            grid-template-columns: 1fr;
          }
        }
        .section-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .btn-today-header {
          background: #0f172a;
          color: white;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 700;
        }
        .btn-today-header:hover {
          background: #334155;
        }
        .date-info-card {
          margin-top: 24px;
          padding: 24px;
          background: #f8fafc;
          border-radius: 16px;
          border: 1px solid #f1f5f9;
        }
        .date-info-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .date-display-text {
          font-size: 16px;
          color: var(--text-main);
        }
        .date-sub-text {
          font-size: 14px;
          color: var(--text-muted);
        }
        .user-info-section {
          margin-top: 32px;
        }
        .premium-input {
          height: 52px;
        }
        .input-hint {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 8px;
          line-height: 1.4;
        }
        .summary-box {
          margin-top: 32px;
          background: #f8fafc;
          border-radius: 16px;
          padding: 32px;
        }
        .summary-title {
          font-weight: 800;
          font-size: 16px;
          margin-bottom: 24px;
          color: var(--text-main);
        }
        .summary-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 15px;
        }
        .item-left {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
        }
        .item-right {
          font-weight: 600;
          color: var(--text-main);
        }
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
        .footer-actions {
          display: flex;
          gap: 16px;
          margin-bottom: 60px;
        }
        .confirm-btn {
          flex: 5;
          height: 60px;
          font-size: 18px;
          border-radius: 12px;
        }
        .reset-btn {
          flex: 1;
          height: 60px;
          font-size: 16px;
          border-radius: 12px;
          color: var(--text-muted);
        }
        .my-status {
          display: flex;
          justify-content: space-between;
          padding: 16px 24px;
          background: white;
          border-radius: var(--radius);
          box-shadow: var(--shadow-sm);
          margin-bottom: 40px;
        }
        .user-profile {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }
        .logout-link {
          background: none;
          color: var(--text-muted);
          font-size: 13px;
          font-weight: 500;
        }
        .logout-link:hover {
          color: var(--danger);
        }
        .auth-footer {
          display: flex;
          justify-content: center;
          margin-bottom: 40px;
        }
        .sub-header {
           font-size: 20px;
           font-weight: 700;
           margin-bottom: 24px;
        }
        .reservation-grid {
           display: grid;
           grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
           gap: 20px;
        }
        .res-card {
           background: white;
           padding: 24px;
           border-radius: 16px;
           border: 1px solid var(--border);
           display: flex;
           justify-content: space-between;
           align-items: center;
           box-shadow: var(--shadow-sm);
        }
        .res-card-date {
           font-weight: 800;
           font-size: 16px;
        }
        .res-card-time {
           font-size: 14px;
           color: var(--accent);
           margin-top: 4px;
           font-weight: 600;
        }
        .delete-btn {
           color: #94a3b8;
           background: none;
           padding: 10px;
           border-radius: 12px;
           transition: all 0.2s;
        }
        .delete-btn:hover {
           color: var(--danger);
           background: #fff1f2;
        }
      `}</style>
    </main>
  );
}

