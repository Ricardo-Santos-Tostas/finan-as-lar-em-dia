import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import type { PeriodMode } from "../model/types";
import type { MovementScope } from "../types";

const periodOptions: { id: PeriodMode; label: string }[] = [
  { id: "day", label: "Dia" },
  { id: "week", label: "Semana" },
  { id: "month", label: "Mês" },
  { id: "year", label: "Ano" },
];

type Props = {
  period: PeriodMode;
  anchorDate: string;
  rangeLabel: string;
  movementScope: MovementScope;
  onPeriodChange: (period: PeriodMode) => void;
  onDateChange: (value: string) => void;
  onMovePeriod: (offset: number) => void;
  onScopeChange: (scope: MovementScope) => void;
};

export default function GlobalFilters({ period, anchorDate, rangeLabel, movementScope, onPeriodChange, onDateChange, onMovePeriod, onScopeChange }: Props) {
  const pickerValue = period === "month" ? anchorDate.slice(0, 7) : period === "year" ? anchorDate.slice(0, 4) : anchorDate;
  const pickerType = period === "month" ? "month" : period === "year" ? "number" : "date";

  return <section className="global-filter-bar" aria-label="Filtros do painel">
    <div className="global-filter-group period-mode-group">
      <span className="filter-caption">PERÍODO</span>
      <div className="period-mode-tabs" role="group" aria-label="Granularidade do período">
        {periodOptions.map((option) => <button key={option.id} className={period === option.id ? "active" : ""} aria-pressed={period === option.id} onClick={() => onPeriodChange(option.id)}>{option.label}</button>)}
      </div>
    </div>
    <div className="global-filter-group range-group">
      <span className="filter-caption">INTERVALO</span>
      <div className="period-picker">
        <button className="month-arrow" onClick={() => onMovePeriod(-1)} aria-label="Período anterior"><ChevronLeft size={17} /></button>
        <label className="period-input-wrap"><CalendarDays size={15} /><input aria-label="Escolher intervalo" type={pickerType} min={period === "year" ? 1900 : undefined} max={period === "year" ? 2100 : undefined} value={pickerValue} onChange={(event) => onDateChange(event.target.value)} /></label>
        <button className="month-arrow" onClick={() => onMovePeriod(1)} aria-label="Próximo período"><ChevronRight size={17} /></button>
      </div>
      <span className="range-caption">{period === "week" ? `Segunda a domingo · ${rangeLabel}` : rangeLabel}</span>
    </div>
    <div className="global-filter-group movement-group">
      <span className="filter-caption">MOVIMENTAÇÕES</span>
      <div className="period-mode-tabs movement-tabs" role="group" aria-label="Tipo de movimentação">
        <button className={movementScope === "all" ? "active" : ""} aria-pressed={movementScope === "all"} onClick={() => onScopeChange("all")}>Todas</button>
        <button className={movementScope === "income" ? "active" : ""} aria-pressed={movementScope === "income"} onClick={() => onScopeChange("income")}>Entradas</button>
        <button className={movementScope === "expense" ? "active" : ""} aria-pressed={movementScope === "expense"} onClick={() => onScopeChange("expense")}>Despesas</button>
        <button className={movementScope === "upcoming" ? "active" : ""} aria-pressed={movementScope === "upcoming"} onClick={() => onScopeChange("upcoming")}>Gastos futuros</button>
      </div>
    </div>
  </section>;
}
