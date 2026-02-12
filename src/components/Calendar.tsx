"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

  const days = [];
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  // Padding for start of month
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dateObj = new Date(year, month, d);
    const isPast = dateObj < today;
    const isSelected = selectedDate === dateStr;
    const isToday = dateObj.toDateString() === today.toDateString();

    days.push(
      <div
        key={d}
        className={`calendar-day ${isPast ? "past" : ""} ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`}
        onClick={() => !isPast && onSelectDate(dateStr)}
      >
        {d}
      </div>
    );
  }

  const weekDayLabels = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={prevMonth} className="btn-icon"><ChevronLeft size={20} /></button>
        <h3>{year}년 {month + 1}월</h3>
        <button onClick={nextMonth} className="btn-icon"><ChevronRight size={20} /></button>
      </div>
      <div className="calendar-grid">
        {weekDayLabels.map((day, i) => (
          <div key={day} className={`weekday ${i === 0 ? "sun" : i === 6 ? "sat" : ""}`}>{day}</div>
        ))}
        {days}
      </div>

      <style jsx>{`
        .calendar {
          flex: 1;
        }
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
        }
        .weekday {
          text-align: center;
          font-size: 13px;
          color: var(--text-muted);
          padding-bottom: 12px;
        }
        .sun { color: #f43f5e; }
        .sat { color: #3b82f6; }
        .calendar-day {
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 12px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .calendar-day:hover:not(.past):not(.empty) {
          background: #f1f5f9;
        }
        .calendar-day.selected {
          background: #1e293b;
          color: white;
        }
        .calendar-day.past {
          color: #cbd5e1;
          cursor: not-allowed;
        }
        .calendar-day.today {
           border: 1px solid var(--primary);
           color: var(--primary);
           font-weight: 700;
        }
        .btn-icon {
          background: transparent;
          border: 1px solid var(--border);
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
        }
        .btn-icon:hover {
          background: #f8fafc;
        }
      `}</style>
    </div>
  );
}
