"use client";

import { useState, useEffect } from "react";
import Calendar from "@/components/Calendar";
import GangnamTimeSelector from "@/components/GangnamTimeSelector";
import AuthModal from "@/components/AuthModal";
import {
  AlertCircle,
  Calendar as CalendarIcon,
  User as UserIcon,
  Clock,
  CheckCircle2,
  Info,
  Phone,
  MessageCircle,
  LogOut,
  ShieldCheck,
} from "lucide-react";

interface GangnamBookingFormProps {
  initialAvailability: Record<string, string[]>;
  initialUser: any;
  initialReservations: any[];
}

// 한국어 날짜 포맷
function formatKoreanDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = weekdays[date.getDay()];
  return `${month}월 ${day}일 (${weekday})`;
}

// 주말 여부 확인
function isWeekend(dateStr: string): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const day = date.getDay();
  return day === 0 || day === 6;
}

export default function GangnamBookingForm({
  initialAvailability,
  initialUser,
  initialReservations,
}: GangnamBookingFormProps) {
  const [user, setUser] = useState<any>(initialUser);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [myReservations, setMyReservations] = useState<any[]>(initialReservations);

  const [allAvailability, setAllAvailability] = useState<Record<string, string[]>>(initialAvailability);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const fetchAllAvailability = async () => {
    try {
      const res = await fetch(`/api/gangnam/reservations`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const availMap: Record<string, string[]> = {};
        data.forEach((r: any) => {
          if (r.status !== "REJECTED") {
            if (!availMap[r.date]) availMap[r.date] = [];
            availMap[r.date].push(r.timeSlot);
          }
        });
        setAllAvailability(availMap);

        // Update my reservations
        if (user) {
          const mine = data.filter((r: any) => r.userId === user.id);
          setMyReservations(mine);
        }
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
      const res = await fetch("/api/gangnam/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          timeSlot: selectedSlot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "예약 요청 실패");
      }

      setSuccess("예약 요청이 완료되었습니다. 승인 결과는 문자로 안내해드립니다.");
      setSelectedSlot("");
      fetchAllAvailability();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = user && selectedDate && selectedSlot;

  const statusLabel = (status: string) => {
    switch (status) {
      case "PENDING": return "대기중";
      case "CONFIRMED": return "승인됨";
      case "REJECTED": return "거절됨";
      default: return status;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "PENDING": return { bg: "#fffbeb", color: "#d97706" };
      case "CONFIRMED": return { bg: "#f0fdf4", color: "#16a34a" };
      case "REJECTED": return { bg: "#fef2f2", color: "#dc2626" };
      default: return { bg: "#f1f5f9", color: "#64748b" };
    }
  };

  return (
    <div className="layout-container">
      {/* Header Section */}
      <div className="header-section">
        <div className="header-content">
          <h1 className="main-title">ASC 강남 라운지 예약</h1>
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
              className="btn-logout-pill"
              onClick={async () => {
                try {
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.reload();
                } catch (error) { console.error("Logout failed", error); }
              }}
            >
              <LogOut size={14} />
              <span>로그아웃</span>
            </button>
          </div>
        ) : (
          <button onClick={() => setShowAuthModal(true)} className="btn-login-header">
            로그인 / 회원가입
          </button>
        )}
      </div>

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

      <div className="booking-grid">
        {/* Left Column: Calendar */}
        <div className="left-side">
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
                <span>{formatKoreanDate(selectedDate)}</span>
                <div className={`badge ${isWeekend(selectedDate) ? "badge-weekend" : "badge-weekday"}`}>
                  {isWeekend(selectedDate) ? "주말" : "평일"}
                </div>
              </div>
            )}
          </div>

          {/* My Reservations Sidebar */}
          {user && myReservations.length > 0 && (
            <div className="my-reservations-sidebar">
              <h2 className="sidebar-heading">나의 예약 현황</h2>
              <div className="reservations-stack">
                {myReservations
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((r) => {
                    const sc = statusColor(r.status);
                    return (
                      <div key={r.id} className="mini-res-card">
                        <div className="mini-res-content">
                          <div className="mini-res-date">{formatKoreanDate(r.date)}</div>
                          <div className="mini-res-time">
                            <Clock size={12} /> {r.timeSlot}
                          </div>
                          <div
                            className="mini-res-status"
                            style={{ background: sc.bg, color: sc.color }}
                          >
                            {statusLabel(r.status)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Time Selection & Form & Confirmation */}
        <div className="right-side">
          {/* Step 2: Time Selection */}
          <div className={`step-card time-section-card ${!selectedDate ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="step-header">
              <div className="step-number">02</div>
              <h3>시간 선택</h3>
              {selectedSlot && <span className="step-check"><CheckCircle2 size={18} /></span>}
            </div>
            <div className="time-selector-wrapper">
              <GangnamTimeSelector
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlot}
                disabledSlots={bookedSlots}
              />
            </div>
          </div>

          {/* Step 3: Summary & Confirmation */}
          <div className="summary-card-main">
            <div className="summary-header">
              <h3>예약 확정</h3>
            </div>
            <div className="summary-body">
              <div className="summary-item">
                <span className="label">날짜</span>
                <span className="value">{formatKoreanDate(selectedDate) || "-"}</span>
              </div>
              <div className="summary-item">
                <span className="label">시간</span>
                <span className="value">{selectedSlot || "-"}</span>
              </div>
              <div className="summary-item">
                <span className="label">예약자</span>
                <span className="value">{user?.name || user?.username || "-"}</span>
              </div>
            </div>

            {/* User Profile Info */}
            {user && (
              <div className="profile-info-section">
                <div className="form-header">
                  <Info size={16} />
                  <span>등록된 정보</span>
                </div>
                <div className="profile-info-grid">
                  <div className="profile-info-item">
                    <MessageCircle size={14} />
                    <span>{user.discordId || "디스코드 미등록"}</span>
                  </div>
                  <div className="profile-info-item">
                    <Phone size={14} />
                    <span>{user.phoneNumber || "전화번호 미등록"}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="summary-footer">
              <button
                className="btn-confirm-booking"
                disabled={!canSubmit || loading}
                onClick={handleReservation}
              >
                {loading ? "처리중..." : "예약 확정하기"}
              </button>
              {!user && <p className="login-hint">* 로그인이 필요합니다</p>}
              {user && <p className="login-hint-info">* 관리자 승인 후 문자로 확정 안내드립니다</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Notice Section */}
      <div className="notice-section-full">
        <div className="notice-header">
          <Info size={18} style={{ color: '#d97706' }} />
          <span>예약 이용 안내</span>
        </div>
        <ul className="notice-list-horizontal">
          <li><CheckCircle2 size={14} /> 예약은 2시간 단위입니다</li>
          <li><CheckCircle2 size={14} /> 하루 최대 1회(2시간) 가능</li>
          <li><CheckCircle2 size={14} /> 평일 20시~22시 / 주말 자유 선택</li>
          <li><CheckCircle2 size={14} /> 권장사항: 일주일에 한 번 정도 이용을 권장합니다</li>
        </ul>
      </div>

      {showAuthModal && (
        <AuthModal
          onSuccess={(u) => {
            setUser(u);
            setShowAuthModal(false);
            fetchAllAvailability();
          }}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      <style jsx>{`
        .layout-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: 'Pretendard', sans-serif;
        }

        /* Header */
        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 20px;
        }
        .main-title {
          font-size: 32px;
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
          padding: 6px 16px 6px 6px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .user-info { display: flex; align-items: center; gap: 12px; }
        .avatar-circle {
          width: 36px; height: 36px;
          background: #4f46e5;
          color: white;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700;
          font-size: 16px;
        }
        .user-text { display: flex; flex-direction: column; }
        .user-name { font-weight: 700; font-size: 13px; color: #1e293b; }
        .user-role { font-size: 11px; color: #64748b; font-weight: 600; display: flex; align-items: center; }
        .btn-logout-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s;
          margin-left: 4px;
          cursor: pointer;
        }
        .btn-logout-pill:hover { background: #fef2f2; color: #ef4444; border-color: #fecaca; }
        .btn-login-header {
          background: #1e293b; color: white;
          padding: 10px 20px; border-radius: 12px;
          font-weight: 600; font-size: 13px;
          transition: all 0.2s;
          border: none; cursor: pointer;
        }
        .btn-login-header:hover { background: #334155; transform: translateY(-1px); }

        /* Alerts */
        .alert { padding: 16px; border-radius: 12px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 500; }
        .alert-error { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; }
        .alert-success { background: #f0fdf4; color: #166534; border: 1px solid #dcfce7; }

        /* Grid Layout */
        .booking-grid {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 32px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .booking-grid { grid-template-columns: 1fr; }
        }

        .left-side { display: flex; flex-direction: column; }
        .right-side { display: flex; flex-direction: column; gap: 24px; }

        /* Steps & Cards */
        .step-card {
          background: white;
          border-radius: 24px;
          padding: 28px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          border: 1px solid #f8fafc;
          display: flex;
          flex-direction: column;
        }
        .step-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .step-number {
          width: 28px; height: 28px;
          background: #1e293b; color: white;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 13px;
        }
        .step-header h3 { font-size: 18px; font-weight: 700; color: #1e293b; margin: 0; }
        .step-check { color: #10b981; margin-left: auto; }

        .selected-date-banner {
          margin-top: 16px;
          background: #f8fafc;
          padding: 14px;
          border-radius: 12px;
          display: flex; align-items: center; gap: 10px;
          color: #1e293b; font-weight: 600; font-size: 14px;
        }

        .time-section-card {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .time-section-card.opacity-50 { opacity: 0.5; }
        .time-section-card.pointer-events-none { pointer-events: none; }
        .time-selector-wrapper { min-height: 0; }

        /* Sidebar Reservations */
        .my-reservations-sidebar { margin-top: 24px; }
        .sidebar-heading {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 12px;
          padding-left: 4px;
        }
        .reservations-stack { display: flex; flex-direction: column; gap: 12px; }
        .mini-res-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #f1f5f9;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
        .mini-res-date { font-weight: 700; font-size: 14px; color: #1e293b; margin-bottom: 6px; }
        .mini-res-time {
          font-size: 11px; color: #64748b; font-weight: 600;
          display: flex; align-items: center; gap: 4px; margin-bottom: 8px;
        }
        .mini-res-status {
          font-size: 12px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 8px;
          display: inline-block;
        }

        /* Summary Card */
        .summary-card-main {
          background: white;
          border-radius: 24px;
          padding: 28px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          border: 1px solid #f8fafc;
        }
        .summary-header h3 { font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 20px; }
        .summary-body {
          display: flex; justify-content: space-between;
          margin-bottom: 24px; background: #f8fafc;
          padding: 20px; border-radius: 16px; gap: 16px;
        }
        @media (max-width: 600px) { .summary-body { flex-direction: column; } }
        .summary-item { display: flex; flex-direction: column; gap: 6px; }
        .label { color: #64748b; font-size: 12px; font-weight: 500; }
        .value { color: #1e293b; font-size: 15px; font-weight: 700; }

        /* Profile Info Section */
        .profile-info-section {
          margin-bottom: 24px;
        }
        .form-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 16px;
        }
        .profile-info-grid {
          display: flex;
          gap: 24px;
          background: #f8fafc;
          padding: 16px 20px;
          border-radius: 12px;
        }
        @media (max-width: 768px) {
          .profile-info-grid { flex-direction: column; gap: 12px; }
        }
        .profile-info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #475569;
          font-weight: 500;
        }

        .btn-confirm-booking {
          width: 100%; padding: 16px;
          background: #4f46e5; color: white;
          border-radius: 14px; font-size: 15px; font-weight: 700;
          transition: all 0.2s; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
          border: none; cursor: pointer;
        }
        .btn-confirm-booking:hover:not(:disabled) {
          background: #4338ca; transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
        }
        .btn-confirm-booking:disabled { background: #cbd5e1; box-shadow: none; cursor: not-allowed; }
        .login-hint { text-align: center; color: #ef4444; font-size: 12px; margin-top: 10px; font-weight: 600; }
        .login-hint-info { text-align: center; color: #d97706; font-size: 12px; margin-top: 10px; font-weight: 600; }

        /* Notice Section */
        .notice-section-full {
          margin-top: 40px; background: #fffbeb;
          border: 1px solid #fef3c7; border-radius: 16px; padding: 24px;
        }
        .notice-header {
          display: flex; align-items: center; gap: 8px;
          font-weight: 700; color: #b45309; margin-bottom: 16px; font-size: 15px;
        }
        .notice-list-horizontal {
          padding-left: 0; margin: 0; list-style: none;
          display: flex; flex-wrap: wrap; gap: 20px;
        }
        .notice-list-horizontal li {
          font-size: 13px; color: #92400e; display: flex; align-items: center; gap: 6px;
        }

        .badge { font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 20px; margin-left: auto; }
        .badge-weekend { background: #eff6ff; color: #2563eb; }
        .badge-weekday { background: #f1f5f9; color: #64748b; }
      `}</style>
    </div>
  );
}
