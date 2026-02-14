"use client";

import { useState, useEffect } from "react";
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
  LogOut,
  ChevronRight,
} from "lucide-react";
import { getSlotsForDate, isWeekendOrHoliday, isHoliday } from "@/utils/timeSlots";

interface BookingFormProps {
  initialAvailability: Record<string, string[]>;
  initialUser: any;
  initialReservations: any[];
}

export default function BookingForm({
  initialAvailability,
  initialUser,
  initialReservations,
}: BookingFormProps) {
  const [user, setUser] = useState<any>(initialUser);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [name, setName] = useState("");
  const [discordId, setDiscordId] = useState("");
  const [reservations, setReservations] = useState<any[]>(initialReservations);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [allAvailability, setAllAvailability] = useState<Record<string, string[]>>(initialAvailability);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

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

  const fetchAllAvailability = async () => {
    try {
      const res = await fetch(`/api/availability`);
      const data = await res.json();
      if (data.availabilityMap) {
        setAllAvailability(data.availabilityMap);
      }
    } catch (err) {
      console.error("Failed to fetch availability", err);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      const slots = allAvailability[selectedDate] || [];
      setBookedSlots(slots);
    } else {
      setBookedSlots([]);
    }
  }, [selectedDate, allAvailability]);

  useEffect(() => {
    if (user) {
      setName(user.name || user.username || "");
      setDiscordId(user.discordId || "");
    }
  }, [user]);

  const disabledSlots = bookedSlots;
  const availableTimeSlots = getSlotsForDate(selectedDate);
  const isWeekend = (dateStr: string) => isWeekendOrHoliday(dateStr);

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
          discordId: discordId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "예약 실패");
      }

      setSuccess("라운지 예약이 확정되었습니다!");
      setSelectedSlot("");

      fetchReservations();
      fetchAllAvailability();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-container">
      <div className="header-section">
        <h1 className="main-title">라운지 예약하기</h1>
        <p className="sub-title">원하는 날짜와 시간을 선택해주세요</p>
      </div>

      <div className="card-body">
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            <div><strong>오류 발생:</strong> {error}</div>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <CheckCircle2 size={20} />
            <div>{success}</div>
          </div>
        )}

        {/* SECTION 1: Date & Time Selection */}
        <div className="main-grid-row">
          <div className="grid-col left-col">
            <div className="section-header-row">
              <div className="section-title">
                <CalendarIcon size={20} className="icon-navy" />
                <h4>날짜 선택</h4>
              </div>
              <button
                className="btn-today"
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
              <div className="date-info-badge-area">
                <span className="date-text">
                  {selectedDate} ({["일", "월", "화", "수", "목", "금", "토"][new Date(selectedDate).getDay()]})
                </span>
                <span className={`badge ${isHoliday(selectedDate) ? "badge-holiday" : isWeekend(selectedDate) ? "badge-weekend" : "badge-weekday"}`}>
                  {isHoliday(selectedDate) ? "공휴일" : isWeekend(selectedDate) ? "주말" : "평일"}
                </span>
              </div>
            )}
          </div>

          <div className="grid-col right-col">
            <TimeSelector
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
              disabledSlots={disabledSlots}
              availableSlots={availableTimeSlots}
            />
          </div>
        </div>

        <div className="divider" />

        {/* SECTION 2: User Info & Summary */}
        <div className="main-grid-row bottom-row">
          <div className="grid-col left-col">
            <div className="section-title">
              <UserIcon size={20} className="icon-navy" />
              <h4>예약자 정보</h4>
            </div>
            <div className="input-group">
              <input
                type="text"
                placeholder="성함"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-premium"
              />
              <input
                type="text"
                placeholder="Discord ID (선택사항 - DM 알림용)"
                value={discordId}
                onChange={(e) => setDiscordId(e.target.value)}
                className="input-premium mt-3"
              />
            </div>
          </div>

          <div className="grid-col right-col">
            <div className="summary-card">
              <h5 className="summary-header">예약 정보 확인</h5>
              <div className="summary-content">
                <div className="summary-row">
                  <span className="label">날짜</span>
                  <span className="value">{selectedDate || "-"}</span>
                </div>
                <div className="summary-row">
                  <span className="label">시간</span>
                  <span className="value">{selectedSlot || "-"}</span>
                </div>
                <div className="summary-row">
                  <span className="label">예약자</span>
                  <span className="value">{name || "-"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="notice-section">
          <div className="notice-header">
            <Info size={18} style={{ color: '#d97706' }} />
            <span>예약 안내</span>
          </div>
          <ul className="notice-list">
            <li>📌 <strong>새로운 정책:</strong> 예약은 3시간 단위로 가능합니다</li>
            <li>📌 <strong>권장사항:</strong> 다른 회원을 위해 일주일에 한 번 정도 이용을 권장합니다</li>
            <li>📌 평일은 저녁 7시부터, 주말은 제한이 없습니다</li>
            <li>📌 1인당 하루 최대 3시간까지 예약 가능합니다</li>
          </ul>
        </div>

        <div className="action-buttons">
          <button
            className="btn-confirm"
            disabled={!selectedDate || !selectedSlot || loading}
            onClick={handleReservation}
          >
            {loading ? <Loader2 className="animate-spin" /> : "예약 확정"}
          </button>
          <button
            className="btn-reset"
            onClick={() => {
              setSelectedDate("");
              setSelectedSlot("");
              setError("");
              setSuccess("");
            }}
          >
            초기화
          </button>
        </div>

        <div className="version-tag">v2.1 (Balanced Layout)</div>

        {user ? (
          <div className="user-bar">
            <div className="user-left">
              <Layout size={16} />
              <span>접속 중: <strong>{user.username}</strong></span>
            </div>
            <button
              className="btn-logout"
              onClick={async () => {
                try {
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.reload();
                } catch (error) { console.error("Logout failed", error); }
              }}
            >
              <LogOut size={14} /> 로그아웃
            </button>
          </div>
        ) : (
          <div className="login-bar">
            <button onClick={() => setShowAuthModal(true)} className="btn-login">
              로그인 / 회원가입
            </button>
          </div>
        )}

        {user && reservations.filter((r) => r.userId === user.id).length > 0 && (
          <div className="my-reservations">
            <h3 className="res-header">내 예약 내역</h3>
            <div className="res-grid">
              {reservations
                .filter((r) => r.userId === user.id)
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((r) => (
                  <div key={r.id} className="res-item">
                    <div className="res-info">
                      <div className="res-date">{r.date}</div>
                      <div className="res-time">{r.timeSlot}</div>
                    </div>
                    <button
                      className="btn-delete"
                      onClick={async () => {
                        if (!confirm("정말 취소하시겠습니까?")) return;
                        await fetch("/api/reservations", {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: r.id }),
                        });
                        fetchReservations();
                        fetchAllAvailability();
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {showAuthModal && (
        <AuthModal
          onSuccess={(u) => { setUser(u); setShowAuthModal(false); }}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      <style jsx>{`
        /* Global Container */
        .booking-container {
            max-width: 900px;
            margin: 40px auto;
            background: white;
            border-radius: 24px;
            box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05);
            padding: 40px;
            border: 1px solid #f1f5f9;
        }
        @media (max-width: 768px) {
            .booking-container {
                padding: 24px;
                margin: 20px auto;
            }
        }

        /* Header */
        .header-section { margin-bottom: 32px; }
        .main-title {
            font-size: 26px;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 6px;
            letter-spacing: -0.02em;
        }
        .sub-title {
            font-size: 15px;
            color: #64748b;
            font-weight: 500;
        }

        /* Layout Grid System */
        .main-grid-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
        }
        .bottom-row {
            align-items: flex-start;
        }
        @media (max-width: 768px) {
            .main-grid-row { grid-template-columns: 1fr; gap: 32px; }
        }

        .divider {
            height: 1px;
            background: #f1f5f9;
            margin: 32px 0;
        }

        /* Section Titles & Headers */
        .section-header-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }
        .section-title {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #1e293b;
            margin-bottom: 16px; /* Default margin for non-header-row titles */
        }
        .section-header-row .section-title { margin-bottom: 0; }
        
        .section-title h4 {
            font-size: 16px;
            font-weight: 700;
            margin: 0;
            letter-spacing: -0.01em;
        }
        .icon-navy { color: #1e293b; }

        .btn-today {
            background: #f1f5f9;
            color: #475569;
            font-size: 13px;
            font-weight: 600;
            padding: 6px 12px;
            border-radius: 8px;
            transition: all 0.2s;
        }
        .btn-today:hover { background: #e2e8f0; color: #1e293b; }

        /* Date Badge */
        .date-info-badge-area {
            margin-top: 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #f8fafc;
            padding: 14px 18px;
            border-radius: 14px;
            border: 1px solid #f1f5f9;
        }
        .date-text { font-weight: 700; color: #334155; font-size: 15px; }
        .badge { font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 20px; }
        .badge-holiday { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        .badge-weekend { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
        .badge-weekday { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }

        /* Inputs */
        .input-premium {
            width: 100%;
            height: 50px;
            padding: 0 16px;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            font-size: 15px;
            transition: all 0.2s;
            color: #1e293b;
            background: #fff;
        }
        .input-premium:focus {
            border-color: #1e293b;
            outline: none;
            box-shadow: 0 0 0 3px rgba(30, 41, 59, 0.05);
        }
        .mt-3 { margin-top: 12px; }

        /* Summary Card */
        .summary-card {
            background: #f8fafc;
            border: 1px solid #f1f5f9;
            padding: 24px;
            border-radius: 16px;
            height: 100%;
        }
        .summary-header {
            font-size: 13px;
            font-weight: 700;
            color: #94a3b8;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 14px;
            margin-bottom: 14px;
            padding-bottom: 14px;
            border-bottom: 1px dashed #e2e8f0;
        }
        .summary-row:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
        }
        .label { color: #64748b; font-weight: 500; }
        .value { font-weight: 700; color: #1e293b; }

        /* Notice Section */
        .notice-section {
            margin-top: 32px;
            background: #fefce8;
            border: 1px solid #fef9c3;
            border-radius: 16px;
            padding: 20px 24px;
        }
        .notice-header {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 700;
            color: #b45309;
            margin-bottom: 10px;
            font-size: 14px;
        }
        .notice-list li {
            font-size: 13px;
            color: #92400e;
            margin-bottom: 4px;
            line-height: 1.6;
        }

        /* Action Buttons */
        .action-buttons {
            display: grid;
            grid-template-columns: 3fr 1fr;
            gap: 16px;
            margin-top: 32px;
        }
        .btn-confirm {
            height: 54px;
            background: #1e293b;
            color: white;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 700;
            transition: all 0.2s;
        }
        .btn-confirm:hover:not(:disabled) {
            background: #0f172a;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
        }
        .btn-confirm:disabled {
            background: #94a3b8;
            cursor: not-allowed;
        }
        .btn-reset {
            height: 54px;
            background: white;
            border: 1px solid #e2e8f0;
            color: #64748b;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 600;
            transition: all 0.2s;
        }
        .btn-reset:hover { border-color: #cbd5e1; color: #334155; }

        /* Misc */
        .alert { padding: 16px; border-radius: 12px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; font-size: 14px; }
        .alert-error { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; }
        .alert-success { background: #f0fdf4; color: #166534; border: 1px solid #dcfce7; }
        .version-tag { text-align: center; color: #cbd5e1; font-size: 11px; margin-top: 32px; font-family: monospace; }
        
        .user-bar, .login-bar { margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 24px; }
        .user-bar { display: flex; justify-content: space-between; align-items: center; }
        .user-left { display: flex; align-items: center; gap: 8px; color: #334155; font-size: 14px; }
        .btn-logout { background: none; color: #94a3b8; font-size: 13px; display: flex; align-items: center; gap: 4px; font-weight: 500; }
        .btn-logout:hover { color: #ef4444; }
        .btn-login { width: 100%; border: 1px solid #e2e8f0; padding: 12px; border-radius: 12px; color: #334155; font-weight: 600; transition: all 0.2s; }
        .btn-login:hover { background: #f8fafc; border-color: #cbd5e1; }

        .my-reservations { margin-top: 40px; }
        .res-header { font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
        .res-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .res-item { background: #fff; border: 1px solid #e2e8f0; padding: 20px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .res-date { font-weight: 700; color: #1e293b; }
        .res-time { font-size: 13px; color: #64748b; margin-top: 2px; }
        .btn-delete { color: #cbd5e1; padding: 8px; border-radius: 8px; transition: all 0.2s; }
        .btn-delete:hover { background: #fee2e2; color: #ef4444; }
      `}</style>
    </div>
  );
}
