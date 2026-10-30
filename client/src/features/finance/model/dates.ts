import type { DateRange, PeriodMode, Transaction } from "./types";

export const parseDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const todayKey = () => dateKey(new Date());

export const normalizePickerValue = (value: string, mode: PeriodMode): string | null => {
  if (!value) return null;
  if (mode === "month") return `${value}-01`;
  if (mode === "year") return `${value}-01-01`;
  return value;
};

export const periodRange = (anchorDate: string, mode: PeriodMode): DateRange => {
  const anchor = parseDateKey(anchorDate);
  if (mode === "day") return { start: dateKey(anchor), end: dateKey(anchor) };
  if (mode === "week") {
    const start = new Date(anchor);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start: dateKey(start), end: dateKey(end) };
  }
  if (mode === "month") return {
    start: dateKey(new Date(anchor.getFullYear(), anchor.getMonth(), 1)),
    end: dateKey(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0)),
  };
  return {
    start: dateKey(new Date(anchor.getFullYear(), 0, 1)),
    end: dateKey(new Date(anchor.getFullYear(), 11, 31)),
  };
};

export const moveAnchorDate = (anchorDate: string, mode: PeriodMode, offset: number) => {
  const anchor = parseDateKey(anchorDate);
  if (mode === "day") anchor.setDate(anchor.getDate() + offset);
  if (mode === "week") anchor.setDate(anchor.getDate() + offset * 7);
  if (mode === "month") return dateKey(new Date(anchor.getFullYear(), anchor.getMonth() + offset, 1));
  if (mode === "year") return dateKey(new Date(anchor.getFullYear() + offset, 0, 1));
  return dateKey(anchor);
};

export const formatPeriodLabel = (range: DateRange, mode: PeriodMode) => {
  const start = parseDateKey(range.start);
  const end = parseDateKey(range.end);
  if (mode === "day") return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric" }).format(start);
  if (mode === "month") return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(start);
  if (mode === "year") return String(start.getFullYear());
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    const month = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(end).replace(".", "");
    return `${start.getDate()}–${end.getDate()} ${month} ${end.getFullYear()}`;
  }
  const dateFormat = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" });
  return `${dateFormat.format(start)} – ${dateFormat.format(end)}, ${end.getFullYear()}`;
};

export const formatDate = (dateString: string) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(parseDateKey(dateString));

export const transactionsInRange = (transactions: Transaction[], range: DateRange) =>
  transactions.filter((item) => item.date >= range.start && item.date <= range.end);
