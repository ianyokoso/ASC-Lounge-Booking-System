"use client";

import { Clock } from "lucide-react";

interface GangnamTimeSelectorProps {
    onSelectSlot: (slot: string) => void;
    selectedSlot: string;
    disabledSlots: string[];
    selectedDate: string; // YYYY-MM-DD
}

const WEEKEND_SLOTS = [
    "10:00-12:00",
    "12:00-14:00",
    "14:00-16:00",
    "16:00-18:00",
    "18:00-20:00",
    "20:00-22:00",
];

const WEEKDAY_SLOTS = [
    "20:00-22:00"
];

export default function GangnamTimeSelector({
    onSelectSlot,
    selectedSlot,
    disabledSlots,
    selectedDate
}: GangnamTimeSelectorProps) {

    // Determine if the selected date is a weekend
    let isWeekend = false;
    if (selectedDate) {
        const dateObj = new Date(selectedDate);
        const day = dateObj.getDay();
        isWeekend = day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
    }

    const currentSlots = isWeekend ? WEEKEND_SLOTS : WEEKDAY_SLOTS;

    return (
        <div className="time-selector">
            <div className="section-title">
                <Clock size={18} />
                <h4>시간 선택</h4>
            </div>

            {!selectedDate ? (
                <div className="text-gray-500 text-sm mt-2">날짜를 먼저 선택해주세요.</div>
            ) : (
                <div className="slots-grid">
                    {currentSlots.map((slot) => {
                        const isDisabled = disabledSlots.includes(slot);
                        const isSelected = selectedSlot === slot;

                        return (
                            <button
                                key={slot}
                                className={`slot-btn ${isSelected ? "selected" : ""} ${isDisabled ? "disabled" : ""}`}
                                onClick={() => !isDisabled && onSelectSlot(slot)}
                                disabled={isDisabled}
                            >
                                <div className="slot-time">{slot}</div>
                                <div className="slot-status">{isDisabled ? "예약 불가" : "예약 가능"}</div>
                            </button>
                        );
                    })}
                </div>
            )}

            <style jsx>{`
        .time-selector {
          margin-top: 32px;
        }
        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
          color: var(--text-main);
        }
        .slots-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 640px) {
            .slots-grid {
                grid-template-columns: repeat(3, 1fr);
            }
        }
        .slot-btn {
          background: white;
          border: 1px solid var(--border);
          padding: 16px;
          text-align: center;
          border-radius: 12px;
          transition: all 0.2s;
        }
        .slot-btn:hover:not(.disabled) {
          border-color: var(--primary);
          background: #f5f3ff;
        }
        .slot-btn.selected {
          border-color: var(--primary);
          background: #4f46e5;
          color: white;
        }
        .slot-btn.disabled {
          background: #f8fafc;
          color: #cbd5e1;
          cursor: not-allowed;
          border-style: dashed;
        }
        .slot-time {
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 4px;
        }
        .slot-status {
          font-size: 12px;
          opacity: 0.8;
        }
        .slot-btn.selected .slot-status {
          opacity: 1;
        }
        .text-gray-500 { color: #6b7280; }
        .text-sm { font-size: 0.875rem; }
        .mt-2 { margin-top: 0.5rem; }
      `}</style>
        </div>
    );
}
