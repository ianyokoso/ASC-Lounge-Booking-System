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
  LogOut,
  Trash2,
  ChevronRight,
  ShieldCheck,
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
        // User info is implicitly handled by the backend session or existing user data
        // We still send the name/discordId if the backend expects it, but we use the user object directly
        body: JSON.stringify({
          date: selectedDate,
          timeSlot: selectedSlot,
          name: user.name || user.username,
          discordId: user.discordId || "",
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
    <div className="layout-container">
      {/* Header Section */}
      <div className="header-section">
        <div className="header-content">
          <h1 className="main-title">라운지 예약</h1>
          <p className="sub-title">편안한 공간에서 최고의 집중을 경험하세요</p>
        </div>

        {user ? (
          <div className="user-profile-card">
            <div className="user-info">
              <div className="avatar-circle">
                {user.username?.[0]?.toUpperCase() || <UserIcon size={18} />}
              </div>
              <div className="user-text">
                <span className="user-name">{user.username}님 안녕하세요!</span>
                <span className="user-role">ASC Member <ShieldCheck size={12} style={{ display: 'inline', marginLeft: 4 }} /></span>
              </div>
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
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button onClick={() => setShowAuthModal(true)} className="btn-login-header">
            로그인 / 회원가입
          </button>
        )}
      </div>

      <div className="booking-grid">
        {/* Left Column: Calendar & Summary (Step 1 & 3) */}
        <div className="main-content">

          {/* Messages */}
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="alert alert-success">
              <CheckCircle2 size={20} />
              <span>{success}</span>
            </div>
          )}

          {/* Step 1: Date */}
          <div className="step-card">
            <div className="step-header">
              <div className="step-number">01</div>
              <h3>날짜 선택</h3>
              {selectedDate && <span className="step-check"><CheckCircle2 size={18} /></span>}
            </div>
            <div className="calendar-wrapper">
              <Calendar
                selectedDate={selectedDate}
                onSelectDate={(date) => {
                  setSelectedDate(date);
                  setSelectedSlot("");
                  setError("");
                }}
              />
            </div>
            {selectedDate && (
              <div className="selected-date-banner">
                <CalendarIcon size={16} />
                <span>{selectedDate}</span>
                <div className={`badge ${isHoliday(selectedDate) ? "badge-holiday" : isWeekend(selectedDate) ? "badge-weekend" : "badge-weekday"}`}>
                  {isHoliday(selectedDate) ? "공휴일" : isWeekend(selectedDate) ? "주말" : "평일"}
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Summary & Confirmation (Moved from Sidebar) */}
          <div className="summary-card-main">
            <div className="summary-header">
              <h3>예약 확정</h3>
            </div>
            <div className="summary-body">
              <div className="summary-item">
                <span className="label">날짜</span>
                <span className="value">{selectedDate || "-"}</span>
              </div>
              <div className="summary-item">
                <span className="label">시간</span>
                <span className="value">{selectedSlot || "-"}</span>
              </div>
              <div className="summary-item">
                <span className="label">예약자</span>
                <span className="value">{user?.username || "-"}</span>
              </div>
            </div>

            <div className="summary-footer">
              <button
                className="btn-confirm-booking"
                disabled={!selectedDate || !selectedSlot || loading || !user}
                onClick={handleReservation}
              >
                {loading ? "처리중..." : "예약 확정하기"}
              </button>
              {!user && <p className="login-hint">* 로그인이 필요합니다</p>}
            </div>
          </div>
        </div>

        {/* Right Column: Time Selection (Step 2) - Sticky Sidebar */}
        <div className="sidebar">
          <div className="sticky-sidebar">
            {/* Step 2: Time */}
            <div className={`step-card-sidebar ${!selectedDate ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="step-header">
                <div className="step-number">02</div>
                <h3>시간 선택</h3>
              </div>
              <div className="time-selector-wrapper">
                <TimeSelector
                  selectedSlot={selectedSlot}
                  onSelectSlot={setSelectedSlot}
                  disabledSlots={disabledSlots}
                  availableSlots={availableTimeSlots}
                />
              </div>
            </div>

            <div className="notice-card">
              <div className="notice-title">
                <Info size={16} /> 이용 안내
              </div>
              <ul>
                <li>예약은 3시간 단위입니다.</li>
                <li>하루 최대 1회(3시간) 가능합니다.</li>
                <li>평일 19시 이후 / 주말 상시 운영</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* My Reservations Section */}
      {user && reservations.filter((r) => r.userId === user.id).length > 0 && (
        <div className="my-reservations-section">
          <h2 className="section-heading">나의 예약 현황</h2>
          <div className="reservations-grid">
            {reservations
              .filter((r) => r.userId === user.id)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // 최신순
              .map((r) => (
                <div key={r.id} className="reservation-card">
                  <div className="res-status-bar"></div>
                  <div className="res-content">
                    <div className="res-time-badge">
                      <Clock size={14} /> {r.timeSlot}
                    </div>
                    <div className="res-date-text">
                      {r.date}
                    </div>
                    <button
                      className="btn-cancel"
                      onClick={async () => {
                        if (!confirm("예약을 취소하시겠습니까?")) return;
                        await fetch("/api/reservations", {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: r.id }),
                        });
                        fetchReservations();
                        fetchAllAvailability();
                      }}
                    >
                      예약 취소
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {showAuthModal && (
        <AuthModal
          onSuccess={(u) => { setUser(u); setShowAuthModal(false); }}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      <style jsx>{`
        .layout-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: 'Pretendard', sans-serif;
        }

        /* Header */
        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 50px;
          flex-wrap: wrap;
          gap: 20px;
        }
        .main-title {
          font-size: 36px;
          font-weight: 800;
          color: #1e293b;
          letter-spacing: -0.03em;
          margin-bottom: 8px;
        }
        .sub-title {
          font-size: 16px;
          color: #64748b;
          font-weight: 500;
        }

        /* User Profile */
        .user-profile-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 50px;
          padding: 8px 16px 8px 8px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .user-info { display: flex; align-items: center; gap: 12px; }
        .avatar-circle {
          width: 40px; height: 40px;
          background: #4f46e5;
          color: white;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700;
          font-size: 18px;
        }
        .user-text { display: flex; flex-direction: column; }
        .user-name { font-weight: 700; font-size: 14px; color: #1e293b; }
        .user-role { font-size: 11px; color: #64748b; font-weight: 600; display: flex; align-items: center; }
        .btn-logout { 
          width: 36px; height: 36px; 
          border-radius: 50%; 
          border: 1px solid #f1f5f9; 
          display: flex; align-items: center; justify-content: center; 
          color: #94a3b8;
          transition: all 0.2s;
        }
        .btn-logout:hover { background: #fef2f2; color: #ef4444; border-color: #fee2e2; }
        .btn-login-header {
          background: #1e293b; color: white;
          padding: 12px 24px; border-radius: 12px;
          font-weight: 600; font-size: 14px;
          transition: all 0.2s;
        }
        .btn-login-header:hover { background: #334155; transform: translateY(-1px); }

        /* Grid Layout */
        .booking-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 40px;
        }
        @media (max-width: 900px) {
          .booking-grid { grid-template-columns: 1fr; }
          .header-section { flex-direction: column; align-items: flex-start; }
        }

        /* Steps */
        .step-card {
          background: white;
          border-radius: 24px;
          padding: 32px;
          margin-bottom: 32px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          border: 1px solid #f8fafc;
        }
        .step-card-sidebar {
          background: white;
          border-radius: 24px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.06);
          border: 1px solid #f1f5f9;
        }
        .step-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        .step-number {
          width: 32px; height: 32px;
          background: #1e293b; color: white;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 14px;
        }
        .step-header h3 { font-size: 20px; font-weight: 700; color: #1e293b; margin: 0; }
        .step-check { color: #10b981; margin-left: auto; }

        .selected-date-banner {
          margin-top: 20px;
          background: #f8fafc;
          padding: 16px;
          border-radius: 12px;
          display: flex; align-items: center; gap: 10px;
          color: #1e293b; font-weight: 600;
        }

        /* Summary Card (Main) */
        .summary-card-main {
          background: white;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          border: 1px solid #f8fafc;
        }
        .summary-header h3 { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 24px; }
        
        .summary-body {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 24px;
          margin-bottom: 32px;
          background: #f8fafc;
          padding: 24px;
          border-radius: 16px;
        }
        @media (max-width: 600px) {
           .summary-body { grid-template-columns: 1fr; }
        }

        .summary-item {
          display: flex; flex-direction: column; gap: 8px;
        }
        .label { color: #64748b; font-size: 13px; font-weight: 500; }
        .value { color: #1e293b; font-size: 16px; font-weight: 700; }

        .btn-confirm-booking {
          width: 100%;
          padding: 18px;
          background: #4f46e5;
          color: white;
          border-radius: 16px;
          font-size: 16px; font-weight: 700;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }
        .btn-confirm-booking:hover:not(:disabled) {
          background: #4338ca; transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
        }
        .btn-confirm-booking:disabled {
          background: #cbd5e1; box-shadow: none; cursor: not-allowed;
        }
        .login-hint { text-align: center; color: #ef4444; font-size: 12px; margin-top: 10px; font-weight: 600; }

        .notice-card {
          margin-top: 24px;
          background: #fffbeb;
          border: 1px solid #fef3c7;
          border-radius: 16px;
          padding: 20px;
        }
        .notice-title {
          font-size: 14px; font-weight: 700; color: #b45309;
          display: flex; align-items: center; gap: 6px; margin-bottom: 12px;
        }
        .notice-card ul { padding-left: 20px; margin: 0; }
        .notice-card li { font-size: 13px; color: #92400e; margin-bottom: 6px; }

        /* My Reservations */
        .my-reservations-section { margin-top: 80px; }
        .section-heading { font-size: 24px; font-weight: 800; margin-bottom: 24px; color: #1e293b; }
        .reservations-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;
        }
        .reservation-card {
          background: white; border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          border: 1px solid #f1f5f9;
          transition: transform 0.2s;
        }
        .reservation-card:hover { transform: translateY(-2px); }
        .res-status-bar { height: 6px; background: #10b981; }
        .res-content { padding: 24px; }
        .res-time-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: #f0fdf4; color: #15803d;
          padding: 6px 12px; border-radius: 20px;
          font-size: 12px; font-weight: 700; margin-bottom: 12px;
        }
        .res-date-text { font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 20px; }
        .btn-cancel {
          width: 100%; padding: 10px;
          border: 1px solid #fee2e2; background: white;
          color: #ef4444; font-weight: 600; border-radius: 10px;
          font-size: 14px; transition: all 0.2s;
        }
        .btn-cancel:hover { background: #fee2e2; }

        /* Alerts */
        .alert { padding: 16px; border-radius: 12px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 500; }
        .alert-error { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; }
        .alert-success { background: #f0fdf4; color: #166534; border: 1px solid #dcfce7; }
        
        .badge { font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 20px; margin-left: auto; }
        .badge-holiday { background: #fef2f2; color: #dc2626; }
        .badge-weekend { background: #eff6ff; color: #2563eb; }
        .badge-weekday { background: #f1f5f9; color: #64748b; }
      `}</style>
    </div>
  );
}
