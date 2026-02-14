"use client";

import { Clock } from "lucide-react";

interface TimeSelectorProps {
  onSelectSlot: (slot: string) => void;
  selectedSlot: string;
  disabledSlots: string[];
  availableSlots: string[];
  isLoading?: boolean;
}

export default function TimeSelector({
  onSelectSlot,
  selectedSlot,
  disabledSlots,
  availableSlots = [],
  isLoading = false
}: TimeSelectorProps) {
  // 슬롯이 없을 때의 표시 로직 추가 (선택적)
  if (availableSlots.length === 0 && !isLoading) {
    return (
      <div className="time-selector-container">
        <div className="section-title">
          <Clock size={20} />
          <h4>시간 선택</h4>
        </div>
        <div className="empty-slots">
          날짜를 먼저 선택해주세요.
        </div>
      </div>
    );
  }

  return (
    <div className="time-selector-container">
      <div className="section-title">
        <Clock size={20} />
        <h4>시간 선택</h4>
      </div>
      <div className="time-cards-grid">
        {availableSlots.map((slot) => {
          const isDisabled = disabledSlots.includes(slot) || isLoading;
          const isSelected = selectedSlot === slot;

          return (
            <div
              key={slot}
              className={`time-card ${isSelected ? "selected" : ""} ${isDisabled ? "disabled" : ""} ${isLoading ? "loading" : ""}`}
              onClick={() => !isDisabled && onSelectSlot(slot)}
            >
              <div className="time-range">{slot}</div>
              <div className="status-label">
                {isLoading ? (
                  "확인 중..."
                ) : isDisabled ? (
                  disabledSlots.includes(slot) ? "예약 불가" : "선택 불가"
                ) : (
                  "예약 가능"
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .time-selector-container {
          width: 100%;
        }
        .section-title {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
            color: #334155;
        }
        .section-title h4 {
            margin: 0;
            font-size: 16px;
            font-weight: 700;
        }
        .time-cards-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        @media (max-width: 640px) {
          .time-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .time-card {
          background: white;
          border: 1px solid #e2e8f0;
          padding: 16px 8px;
          text-align: center;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          gap: 4px;
          position: relative;
          overflow: hidden;
        }
        .time-card:hover:not(.disabled):not(.selected) {
          border-color: #94a3b8;
          background: #f8fafc;
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .time-card.selected {
          border-color: #1e293b;
          background: #1e293b; /* Deep Navy */
          color: white;
          box-shadow: 0 4px 12px rgba(30, 41, 59, 0.25);
          transform: scale(1.02);
        }
        .time-card.disabled {
          background: #f8fafc;
          color: #cbd5e1;
          cursor: not-allowed;
          border-color: #f1f5f9;
        }
        .time-card.loading {
          background: #f8fafc;
          color: #94a3b8;
          cursor: wait;
          border-color: #e2e8f0;
          opacity: 0.8;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { opacity: 0.8; }
          50% { opacity: 0.5; }
          100% { opacity: 0.8; }
        }
        .time-range {
          font-weight: 700;
          font-size: 14px;
          color: inherit;
        }
        .status-label {
          font-size: 11px;
          font-weight: 500;
          opacity: 0.8;
        }
        .time-card.selected .status-label {
          opacity: 1;
        }
        .empty-slots {
            padding: 30px;
            text-align: center;
            background: #f8fafc;
            border-radius: 12px;
            color: #64748b;
            font-size: 14px;
            border: 1px dashed #cbd5e1;
        }
      `}</style>
    </div>
  );
}

