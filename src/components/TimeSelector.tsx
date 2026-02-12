"use client";

import { Clock } from "lucide-react";

interface TimeSelectorProps {
    onSelectSlot: (slot: string) => void;
    selectedSlot: string;
    disabledSlots: string[];
}

const SLOTS = [
    "19:00-22:00",
    "20:00-23:00",
    "21:00-24:00"
];

export default function TimeSelector({ onSelectSlot, selectedSlot, disabledSlots }: TimeSelectorProps) {
    return (
        <div className="time-selector">
            <div className="section-title">
                <Clock size={18} />
                <h4>시간 선택</h4>
            </div>
            <div className="slots-grid">
                {SLOTS.map((slot) => {
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
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
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
      `}</style>
        </div>
    );
}
