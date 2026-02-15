"use client";

import { useState, useEffect } from "react";
import {
    Loader2,
    ArrowLeft,
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    TrendingUp,
    Clock
} from "lucide-react";
import Link from "next/link";
import { getSlotsForDate, isHoliday as checkIsHoliday } from "@/utils/timeSlots";

interface AdminDashboardProps {
    initialReservations: any[];
}

export default function AdminDashboard({ initialReservations }: AdminDashboardProps) {
    const [reservations, setReservations] = useState<any[]>(initialReservations);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string>("");

    // Initialize selected date to today
    useEffect(() => {
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        setSelectedDate(dateStr);
    }, []);

    // Helper to refresh data (client-side update if needed)
    const fetchReservations = async () => {
        try {
            const res = await fetch("/api/admin/reservations");
            const data = await res.json();
            if (data.reservations && Array.isArray(data.reservations)) {
                setReservations(data.reservations);
            }
        } catch (err) {
            console.error("Failed to refresh reservations");
        }
    };

    // Calendar Helper Functions
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay, year, month };
    };

    const { days, firstDay, year, month } = getDaysInMonth(currentDate);

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`);
    };

    // Data Processing for Selected Date
    const getDailyStats = (dateStr: string) => {
        if (!dateStr) return { total: 0, booked: 0, available: 0, slots: [] };
        const totalSlots = getSlotsForDate(dateStr);
        const booked = reservations.filter(r => r.date === dateStr);
        return {
            total: totalSlots.length,
            booked: booked.length,
            available: Math.max(0, totalSlots.length - booked.length),
            slots: totalSlots
        };
    };

    const dailyStats = getDailyStats(selectedDate);

    // Calendar Grid Gen
    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) calendarDays.push(null);
    for (let i = 1; i <= days; i++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
        const stats = getDailyStats(dateStr);
        calendarDays.push({ day: i, dateStr, stats });
    }

    return (
        <main className="dashboard-container">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-left">
                    <Link href="/" className="back-btn">
                        <ArrowLeft size={24} />
                    </Link>
                    <img
                        src="/asc-logo.png"
                        alt="ASC Logo"
                        style={{
                            width: '50px',
                            height: '50px',
                            objectFit: 'contain',
                            display: 'block',
                            marginLeft: '8px'
                        }}
                    />
                    <h1 style={{ fontSize: '28px', fontWeight: '800', marginLeft: '16px', margin: 0 }}>예약 현황</h1>
                </div>
                <button onClick={goToToday} className="btn-today">오늘</button>
            </header>

            {/* Calendar Section */}
            <section className="card calendar-card">
                <div className="calendar-header">
                    <button onClick={prevMonth} className="nav-btn"><ChevronLeft size={20} /></button>
                    <h2>{year}년 {String(month + 1).padStart(2, "0")}월</h2>
                    <button onClick={prevMonth} className="nav-btn hidden"><ChevronLeft size={20} /></button>
                    <button onClick={nextMonth} className="nav-btn"><ChevronRight size={20} /></button>
                </div>

                <div className="calendar-grid">
                    {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
                        <div key={d} className={`weekday ${i === 0 ? "sun" : i === 6 ? "sat" : ""}`}>{d}</div>
                    ))}
                    {calendarDays.map((item, idx) => {
                        if (!item) return <div key={`empty-${idx}`} className="day-cell empty"></div>;

                        const isSelected = selectedDate === item.dateStr;
                        const isFull = item.stats.total > 0 && item.stats.available === 0;
                        const isHoliday = checkIsHoliday(item.dateStr);
                        const dayOfWeek = new Date(item.dateStr).getDay();
                        // Red if Sunday (0) OR Holiday
                        const isRed = dayOfWeek === 0 || isHoliday;
                        const isBlue = dayOfWeek === 6 && !isHoliday;

                        return (
                            <div
                                key={item.dateStr}
                                className={`day-cell ${isSelected ? "selected" : ""}`}
                                onClick={() => setSelectedDate(item.dateStr)}
                            >
                                <span className={`day-num ${isRed ? "sun" : isBlue ? "sat" : ""}`}>
                                    {item.day}
                                </span>
                                <div className={`status-chip ${isFull ? "full" : "avail"}`}>
                                    {isFull ? "예약 마감" : `빈 슬롯 ${item.stats.available}`}
                                </div>
                                {isHoliday && <div className="holiday-dot" title="공휴일"></div>}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Stats Row */}
            <section className="stats-row">
                <div className="stat-card">
                    <div className="stat-content">
                        <div className="stat-label">전체 슬롯</div>
                        <div className="stat-value">{dailyStats.total}</div>
                    </div>
                    <div className="stat-icon-wrapper gray">
                        <CalendarIcon size={24} />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-content">
                        <div className="stat-label">예약 확정</div>
                        <div className="stat-value text-green">{dailyStats.booked}</div>
                    </div>
                    <div className="stat-icon-wrapper green">
                        <CheckCircle2 size={24} />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-content">
                        <div className="stat-label">예약 가능</div>
                        <div className="stat-value text-blue">{dailyStats.available}</div>
                    </div>
                    <div className="stat-icon-wrapper blue">
                        <TrendingUp size={24} />
                    </div>
                </div>
            </section>

            {/* Daily Detail View */}
            <section className="card daily-detail-card">
                <div className="detail-header">
                    <h3>
                        {year}년 {String(month + 1).padStart(2, "0")}월 {selectedDate.split('-')[2]}일
                        ({["일", "월", "화", "수", "목", "금", "토"][new Date(selectedDate).getDay()]}) 시간대별 현황
                    </h3>
                    <div className="detail-badges">
                        <span className="badge-tag">3시간 단위 예약 슬롯 현황</span>
                    </div>
                </div>

                <div className="slots-grid">
                    {dailyStats.slots.length > 0 ? dailyStats.slots.map((slot, i) => {
                        const isBooked = reservations.some(r => r.date === selectedDate && r.timeSlot === slot);
                        const booking = reservations.find(r => r.date === selectedDate && r.timeSlot === slot);

                        return (
                            <div key={slot} className={`slot-card ${isBooked ? "booked" : "avail"}`}>
                                <div className="slot-header">
                                    <Clock size={14} />
                                    <span>{slot}</span>
                                    {isBooked && <div className="status-dot booked"></div>}
                                    {!isBooked && <div className="status-dot avail"></div>}
                                </div>
                                <div className="slot-body">
                                    <div className="slot-info">3시간 슬롯</div>
                                    <div className={`slot-status ${isBooked ? "booked" : "avail"}`}>
                                        ● {isBooked ? "예약 확정" : "예약 가능"}
                                    </div>
                                </div>
                                <div className="slot-footer">
                                    <span className="slot-id">슬롯 #{i + 1}</span>
                                    <button className="slot-action" disabled={isBooked}>
                                        {isBooked ? (booking?.user?.username || booking?.user?.name || "예약됨") : "이용 가능"}
                                    </button>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="no-slots">해당 날짜에 예약 가능한 슬롯이 없습니다.</div>
                    )}
                </div>

                <div className="legend">
                    <span className="legend-item"><span className="dot avail"></span> 예약 가능</span>
                    <span className="legend-item"><span className="dot booked"></span> 예약 확정</span>
                </div>
            </section>

            {/* Recent Reservations (Simple List) */}
            <section className="recent-list-section">
                <h3>최근 예약 내역</h3>
                <p>전체 예약 중 최근 10건 표시</p>
                <div className="empty-state-box">
                    <CalendarIcon size={32} />
                    <p>예약 내역이 없습니다</p>
                    <span>아직 등록된 예약이 없습니다. 첫 번째 예약을 만들어보세요!</span>
                </div>
            </section>

            <style jsx>{`
                /* Container */
                .dashboard-container {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 40px 20px;
                    background-color: #f8fafc;
                    min-height: 100vh;
                }

                /* Header */
                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 32px;
                }
                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .header-left h1 {
                    font-size: 24px;
                    font-weight: 800;
                    color: #1e293b;
                    margin: 0;
                }
                .back-btn {
                    display: flex;
                    align-items: center;
                    color: #64748b;
                    transition: color 0.2s;
                }
                .back-btn:hover { color: #1e293b; }
                .btn-today {
                    background: #1e293b;
                    color: white;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                }

                /* Card Generic */
                .card {
                    background: white;
                    border-radius: 24px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                    border: 1px solid #e2e8f0;
                    padding: 32px;
                    margin-bottom: 24px;
                }

                /* Monthly Calendar */
                .calendar-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }
                .calendar-header h2 {
                    font-size: 20px;
                    font-weight: 800;
                    color: #1e293b;
                }
                .nav-btn {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    background: white;
                    color: #64748b;
                }
                .nav-btn:hover { background: #f1f5f9; color: #1e293b; }

                .calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 8px;
                    text-align: center;
                }
                .weekday {
                    font-size: 13px;
                    font-weight: 600;
                    color: #64748b;
                    padding: 12px 0;
                }
                .weekday.sun { color: #ef4444; }
                .weekday.sat { color: #3b82f6; }
                
                .day-cell {
                    border: 1px solid #f1f5f9;
                    border-radius: 12px;
                    padding: 12px 4px;
                    min-height: 80px;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: space-between;
                    transition: all 0.2s;
                    background: white;
                    position: relative;
                }
                .day-cell:hover { border-color: #cbd5e1; transform: translateY(-2px); }
                .day-cell.selected {
                    border-color: #1e293b;
                    background: #1e293b;
                }
                .day-cell.selected .day-num { color: white; }
                .day-cell.selected .status-chip { background: white; color: #1e293b; }
                .day-cell.empty { border: none; background: transparent; cursor: default; }
                
                .day-num { font-size: 14px; font-weight: 600; color: #334155; }
                .day-num.sun { color: #ef4444; }
                .day-num.sat { color: #3b82f6; }

                .status-chip {
                    font-size: 11px;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-weight: 600;
                    width: 90%;
                }
                .status-chip.avail { background: #eff6ff; color: #3b82f6; }
                .status-chip.full { background: #fef2f2; color: #ef4444; }
                
                .holiday-dot {
                    width: 6px;
                    height: 6px;
                    background-color: #ef4444;
                    border-radius: 50%;
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    border: 1px solid white;
                }

                /* Stats Row */
                .stats-row {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr); /* Changed to 3 columns */
                    gap: 20px;
                    margin-bottom: 24px;
                }
                .stat-card {
                    background: white;
                    padding: 24px;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }
                .stat-label { font-size: 13px; color: #64748b; font-weight: 600; margin-bottom: 8px; }
                .stat-value { font-size: 28px; font-weight: 800; color: #1e293b; }
                .stat-icon { position: absolute; right: 24px; top: 24px; opacity: 0.1; width: 40px; height: 40px; }
                
                .text-green { color: #10b981; }
                .text-orange { color: #f59e0b; }
                .text-blue { color: #3b82f6; }

                /* Daily Grid */
                .daily-detail-card { background: #eef2ff; border: none; }
                .detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .detail-header h3 { font-size: 18px; font-weight: 800; color: #1e293b; }
                
                .slots-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                }
                .slot-card {
                    background: white;
                    border-radius: 16px;
                    padding: 20px;
                    border: 1px solid #e2e8f0;
                }
                .slot-card.avail { border-left: 4px solid #10b981; }
                .slot-card.booked { border-left: 4px solid #ef4444; background: #fef2f2; }

                .slot-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-weight: 700; font-size: 15px; }
                .status-dot { width: 8px; height: 8px; border-radius: 50%; }
                .status-dot.avail { background: #10b981; }
                .status-dot.booked { background: #ef4444; }

                .slot-body { margin-bottom: 16px; }
                .slot-info { font-size: 12px; color: #94a3b8; margin-bottom: 4px; }
                .slot-status { font-size: 13px; font-weight: 600; }
                .slot-status.avail { color: #10b981; }
                .slot-status.booked { color: #ef4444; }

                .slot-footer { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #64748b; padding-top: 12px; border-top: 1px solid #f1f5f9; }
                .slot-action { font-weight: 600; color: #10b981; }
                .booked .slot-action { color: #ef4444; }

                /* Legend */
                .legend { display: flex; justify-content: center; gap: 24px; margin-top: 32px; font-size: 13px; color: #64748b; font-weight: 600; }
                .legend-item { display: flex; align-items: center; gap: 6px; }
                .dot { width: 8px; height: 8px; border-radius: 50%; }
                .dot.avail { background: #10b981; }
                .dot.wait { background: #f59e0b; }
                .dot.booked { background: #ef4444; }

                /* Recent List */
                .recent-list-section { margin-top: 40px; }
                .recent-list-section h3 { font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
                .recent-list-section p { font-size: 14px; color: #64748b; margin-bottom: 24px; }
                .empty-state-box {
                    background: white;
                    border: 1px dashed #cbd5e1;
                    border-radius: 16px;
                    padding: 60px 0;
                    text-align: center;
                    color: #94a3b8;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                }
                .empty-state-box p { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0; }
                
                @media (max-width: 1024px) {
                    .stats-row, .slots-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 640px) {
                    .stats-row, .slots-grid { grid-template-columns: 1fr; }
                    .calendar-grid { font-size: 11px; }
                    .status-chip { font-size: 10px; padding: 2px 4px; }
                }
            `}</style>
        </main>
    );
}
