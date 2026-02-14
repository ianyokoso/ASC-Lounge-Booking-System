"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { isHoliday } from "@/utils/timeSlots";

interface CalendarProps {
  onSelectDate: (date: string) => void;
  selectedDate: string;
}

export default function Calendar({ onSelectDate, selectedDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  // Previous month days
  const prevMonthDate = new Date(year, month - 1);
  const prevMonthDays = daysInMonth(prevMonthDate.getFullYear(), prevMonthDate.getMonth());

  const days = [];

  // Add days from previous month
  for (let i = startDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    days.push({
      day: d,
      month: month - 1,
      year: year,
      faded: true,
      id: `prev-${d}`
    });
  }

  // Add current month days
  for (let d = 1; d <= totalDays; d++) {
    days.push({
      day: d,
      month: month,
      year: year,
      faded: false,
      id: `curr-${d}`
    });
  }

  // Add next month days to complete the grid (6 rows * 7 days = 42)
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    days.push({
      day: d,
      month: month + 1,
      year: year,
      faded: true,
      id: `next-${d}`
    });
  }

  const weekDayLabels = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="calendar-card">
      <div className="calendar-nav-row">
        <button onClick={prevMonth} className="nav-icon-btn"><ChevronLeft size={20} /></button>
        <span className="nav-title">{year}년 {month + 1}월</span>
        <button onClick={nextMonth} className="nav-icon-btn"><ChevronRight size={20} /></button>
      </div>

      <div className="calendar-grid">
        {weekDayLabels.map((label, i) => (
          <div key={label} className={`weekday-label ${i === 0 ? "sun" : i === 6 ? "sat" : ""}`}>
            {label}
          </div>
        ))}

        {days.map((item) => {
          const dateObj = new Date(item.year, item.month, item.day);
          const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
          const isSelected = selectedDate === dateStr;
          const isToday = dateObj.toDateString() === today.toDateString();
          const isPast = dateObj < today;
          const dayOfWeek = dateObj.getDay();
          const isHolidayDate = isHoliday(dateStr);

          // 일요일이거나 공휴일이면 빨간색 (sun 클래스)
          const isRedDay = dayOfWeek === 0 || isHolidayDate;
          const isBlueDay = dayOfWeek === 6 && !isHolidayDate; // 토요일은 공휴일 아니면 파란색

          return (
            <div
              key={item.id}
              className={`day-cell ${item.faded ? "faded" : ""} ${isSelected ? "selected" : ""} ${isToday ? "today" : ""} ${isPast && !item.faded ? "past" : ""}`}
              onClick={() => !isPast && !item.faded && onSelectDate(dateStr)}
            >
              <div className={`day-number ${isRedDay ? "sun" : isBlueDay ? "sat" : ""}`}>
                {item.day}
              </div>
              {isToday && <div className="today-dot" />}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .calendar-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          user-select: none;
          box-shadow: 0 4px 6px -2px rgba(0,0,0,0.03);
        }
        .calendar-nav-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding: 0 4px;
        }
        .nav-icon-btn {
          background: white;
          border: 1px solid #e2e8f0;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          transition: all 0.2s;
        }
        .nav-icon-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #1e293b;
        }
        .nav-title {
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
          letter-spacing: -0.02em;
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
        }
        .weekday-label {
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          padding: 12px 0;
          text-transform: uppercase;
        }
        .weekday-label.sun { color: #f43f5e; }
        .weekday-label.sat { color: #3b82f6; }

        .day-cell {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 50%; /* Circle shape as requested */
          position: relative;
          transition: all 0.2s;
        }
        .day-number {
          font-size: 15px;
          font-weight: 500;
          color: #334155;
        }
        .day-number.sun { color: #f43f5e; }
        .day-number.sat { color: #3b82f6; }

        .day-cell.faded .day-number {
          color: #e2e8f0;
        }
        .day-cell.past:not(.faded) .day-number {
          color: #cbd5e1;
        }
        .day-cell.past:not(.faded) {
          cursor: not-allowed;
        }

        .day-cell:hover:not(.faded):not(.past):not(.selected) {
          background: #f1f5f9;
        }

        .day-cell.today {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }
        .day-cell.today .day-number {
          font-weight: 700;
          color: #1e293b;
        }
        .today-dot {
          width: 4px;
          height: 4px;
          background: #1e293b;
          border-radius: 50%;
          position: absolute;
          bottom: 8px;
        }

        .day-cell.selected {
          background: #1e293b; /* Deep Navy selected state */
          border-color: #1e293b;
        }
        .day-cell.selected .day-number {
          color: white; /* White text on active */
          font-weight: 600;
        }
        .day-cell.selected .today-dot {
          background: white;
        }
      `}</style>
    </div>
  );
}

