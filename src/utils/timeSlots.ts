
export const WEEKDAY_SLOTS = [
    "19:00-22:00",
    "20:00-23:00",
    "21:00-24:00"
];

export const WEEKEND_SLOTS = [
    "10:00-13:00", "11:00-14:00", "12:00-15:00",
    "13:00-16:00", "14:00-17:00", "15:00-18:00",
    "16:00-19:00", "17:00-20:00", "18:00-21:00",
    "19:00-22:00", "20:00-23:00", "21:00-24:00"
];

// 간단한 공휴일 목록 (필요시 확장)
const HOLIDAYS = [
    "2026-01-01", // 신정
    "2026-02-17", "2026-02-18", "2026-02-19", // 설날
    "2026-03-01", // 삼일절
    "2026-05-05", // 어린이날
    "2026-05-24", // 부처님오신날
    "2026-06-06", // 현충일
    "2026-08-15", // 광복절
    "2026-09-24", "2026-09-25", "2026-09-26", // 추석
    "2026-10-03", // 개천절
    "2026-10-09", // 한글날
    "2026-12-25", // 성탄절
];

export function isHoliday(dateStr: string): boolean {
    return HOLIDAYS.includes(dateStr);
}

export function isWeekendOrHoliday(dateStr: string): boolean {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const day = date.getDay();
    return day === 0 || day === 6 || isHoliday(dateStr);
}

export function getSlotsForDate(dateStr: string): string[] {
    if (!dateStr) return [];
    return isWeekendOrHoliday(dateStr) ? WEEKEND_SLOTS : WEEKDAY_SLOTS;
}
