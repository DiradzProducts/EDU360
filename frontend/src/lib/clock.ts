/**
 * Dynamic Clock Provider for EDU360
 * Eliminates hardcoded simulation dates (such as 2026-10-17) and provides
 * dynamic calendar math, today calculation, and week strip generation.
 */

export interface DayStripItem {
  dayName: string;
  dayNum: number;
  month: string;
  dateKey: string; // 'YYYY-MM-DD'
  label: string;   // '16 Nov 2026'
  isToday: boolean;
}

export class ClockProvider {
  private static overrideDate: Date | null = null;

  public static setOverride(date: Date | null) {
    ClockProvider.overrideDate = date;
  }

  public static getNow(): Date {
    if (ClockProvider.overrideDate) {
      return new Date(ClockProvider.overrideDate);
    }
    return new Date();
  }

  public static getTodayKey(): string {
    const d = ClockProvider.getNow();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  public static formatDateLabel(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  /**
   * Generates a dynamic 6-day (Mon-Sat) week strip containing the reference date.
   */
  public static getWeekDays(refDate?: Date): DayStripItem[] {
    const base = refDate ? new Date(refDate) : ClockProvider.getNow();
    const currentDay = base.getDay(); // 0 is Sunday, 1 is Monday...
    // Calculate Monday of the week
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(base);
    monday.setDate(base.getDate() + distanceToMonday);

    const days: DayStripItem[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const todayKey = ClockProvider.getTodayKey();

    // Monday through Saturday (6 school days)
    for (let i = 0; i < 6; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      days.push({
        dayName: dayNames[d.getDay()],
        dayNum: d.getDate(),
        month: months[d.getMonth()],
        dateKey,
        label: `${d.getDate()} ${months[d.getMonth()]} ${year}`,
        isToday: dateKey === todayKey
      });
    }

    return days;
  }

  /**
   * Evaluates if a task with due_date is overdue relative to the dynamic clock.
   */
  public static isOverdue(dueDate?: string, status?: string): boolean {
    if (status === 'BACKLOG') return true;
    if (!dueDate) return false;
    if (status === 'SUBMITTED' || status === 'GRADED') return false;
    const todayKey = ClockProvider.getTodayKey();
    return dueDate < todayKey;
  }

  /**
   * Evaluates if a task is due today relative to the dynamic clock.
   */
  public static isDueToday(dueDate?: string, status?: string): boolean {
    if (!dueDate) return false;
    if (status === 'SUBMITTED' || status === 'GRADED') return false;
    const todayKey = ClockProvider.getTodayKey();
    return dueDate === todayKey;
  }

  /**
   * Sync with backend system clock
   */
  public static async syncWithBackend(): Promise<void> {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/system/clock`);
      if (res.ok) {
        const data = await res.json();
        if (data.is_overridden && data.iso) {
          ClockProvider.setOverride(new Date(data.iso));
        } else {
          ClockProvider.setOverride(null);
        }
      }
    } catch {
      // Fallback gracefully to local browser time
    }
  }
}
