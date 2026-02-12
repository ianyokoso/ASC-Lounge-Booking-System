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
    <div className="time-selector-container">
      <div className="section-title">
        <Clock size={20} />
        <h4>시간 선택</h4>
      </div>
      <div className="time-cards-grid">
        {SLOTS.map((slot) => {
          const isDisabled = disabledSlots.includes(slot);
          const isSelected = selectedSlot === slot;

          return (
            <div
              key={slot}
              className={`time-card ${isSelected ? "selected" : ""} ${isDisabled ? "disabled" : ""}`}
              onClick={() => !isDisabled && onSelectSlot(slot)}
            >
              <div className="time-range">{slot}</div>
              <div className="status-label">{isDisabled ? "예약 불가" : "예약 가능"}</div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .time-selector-container {
          width: 100%;
        }
        .time-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        @media (max-width: 640px) {
          .time-cards-grid {
            grid-template-columns: 1fr;
          }
        }
        .time-card {
          background: white;
          border: 1px solid #f1f5f9;
          padding: 24px 16px;
          text-align: center;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .time-card:hover:not(.disabled):not(.selected) {
          border-color: #cbd5e1;
          background: #f8fafc;
          transform: translateY(-2px);
        }
        .time-card.selected {
          border-color: #0f172a;
          background: #0f172a;
          color: white;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        }
        .time-card.disabled {
          background: #f8fafc;
          color: #cbd5e1;
          cursor: not-allowed;
          border-color: #f1f5f9;
        }
        .time-range {
          font-weight: 700;
          font-size: 16px;
          color: inherit;
        }
        .status-label {
          font-size: 13px;
          font-weight: 500;
          opacity: 0.8;
        }
        .time-card.selected .status-label {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}

