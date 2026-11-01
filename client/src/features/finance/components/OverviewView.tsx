import { ArrowDownRight, ArrowUpRight, Clock, Home, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import EmptyChart from "./EmptyChart";
import TransactionTable from "./TransactionTable";
import { categoryBreakdown, currency } from "../model/calculations";
import type { FinanceCategory, FlowPoint, PeriodMode, Transaction, TransactionType } from "../model/types";
import type { MovementScope } from "../types";

type Totals = { income: number; expenses: number; upcoming: number; balance: number };
type BreakdownItem = FinanceCategory & { amount: number };
type Props = {
  period: PeriodMode;
  rangeLabel: string;
  movementScope: MovementScope;
  transactions: Transaction[];
  totals: Totals;
  heroValue: number;
  heroLabel: string;
  heroStatus: string;
  flow: FlowPoint[];
  breakdown: BreakdownItem[];
  breakdownType: TransactionType;
  breakdownTotal: number;
  categories: FinanceCategory[];
  onEdit: (item: Transaction) => void;
  onRemove: (item: Transaction) => void;
  onPay: (item: Transaction) => void;
  onSeeAll: () => void;
};

const periodLabel: Record<PeriodMode, string> = { day: "Dia", week: "Semana", month: "Mês", year: "Ano" };

export default function OverviewView({ period, rangeLabel, movementScope, transactions, totals, heroValue, heroLabel, heroStatus, flow, breakdown, breakdownType, breakdownTotal, categories, onEdit, onRemove, onPay, onSeeAll }: Props) {
  const latestTransactions = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const settledTransactions = transactions.filter((item) => item.type !== "upcoming");
  const expenseCategoryCount = categoryBreakdown(transactions, "expense", categories).length;
  const showIncome = movementScope !== "expense" && movementScope !== "upcoming";
  const showExpenses = movementScope !== "income" && movementScope !== "upcoming";
  const movementCaption = movementScope === "all" ? "todas as movimentações" : movementScope === "income" ? "somente entradas" : movementScope === "upcoming" ? "somente gastos futuros" : "somente despesas";
  const isIncomeBreakdown = breakdownType === "income";
  const isUpcomingBreakdown = breakdownType === "upcoming";

  return <>
    <section className="overview-top" aria-label="Resumo do período">
      <div className={`balance-card ${movementScope === "all" && totals.balance < 0 ? "balance-negative" : ""}`}>
        <div className="balance-card-top"><span className="balance-label">{heroLabel.toUpperCase()}</span><span className="balance-icon"><Wallet size={19} /></span></div>
        <div className="balance-amount">{currency(heroValue)}</div>
        <div className="balance-foot"><span className="balance-status-dot" />{heroStatus}</div>
        <div className="balance-watermark"><Home size={102} strokeWidth={0.8} /></div>
      </div>
      <div className="metric-card income-metric"><div className="metric-top"><span>Entradas</span><span className="metric-icon income-icon"><ArrowDownRight size={17} /></span></div><strong>{currency(totals.income)}</strong><small>Receitas no intervalo</small><div className="metric-accent income-accent" /></div>
      <div className="metric-card expense-metric"><div className="metric-top"><span>Despesas</span><span className="metric-icon expense-icon"><ArrowUpRight size={17} /></span></div><strong>{currency(totals.expenses)}</strong><small>{expenseCategoryCount} categorias no intervalo</small><div className="metric-accent expense-accent" /></div>
      <div className="metric-card upcoming-metric"><div className="metric-top"><span>Gastos futuros</span><span className="metric-icon upcoming-icon"><Clock size={17} /></span></div><strong>{currency(totals.upcoming)}</strong><small>Ainda não saíram da conta</small><div className="metric-accent upcoming-accent" /></div>
    </section>

    <section className="chart-grid">
      <article className="panel flow-panel">
        <div className="panel-heading"><div><span className="eyebrow">MOVIMENTO DO PERÍODO</span><h2>Entradas e saídas</h2><p>{rangeLabel} · {movementCaption}</p></div><span className="panel-chip">{periodLabel[period]}</span></div>
        {settledTransactions.length ? <div className="flow-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={flow} margin={{ top: 8, right: 6, left: 0, bottom: 0 }} barGap={8}>
          <CartesianGrid vertical={false} stroke="#edf0eb" strokeDasharray="3 5" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#89918a", fontSize: 10 }} dy={9} interval={period === "year" ? 1 : "preserveStartEnd"} />
          <YAxis axisLine={false} tickLine={false} width={54} tick={{ fill: "#89918a", fontSize: 10 }} tickFormatter={(value: number) => value === 0 ? "R$ 0" : `${Math.round(value / 1000)} mil`} />
          <Tooltip cursor={{ fill: "#f6f8f5" }} formatter={(value) => [currency(Number(value))]} contentStyle={{ border: "1px solid #e9ede8", borderRadius: 12, boxShadow: "0 8px 24px #263b2a12", fontSize: 12 }} labelStyle={{ color: "#53605a", fontWeight: 700 }} />
          {showIncome && <Bar dataKey="Receitas" fill="#6c9b7f" radius={[5, 5, 0, 0]} maxBarSize={24} />}
          {showExpenses && <Bar dataKey="Despesas" fill="#e3a17f" radius={[5, 5, 0, 0]} maxBarSize={24} />}
        </BarChart></ResponsiveContainer></div> : <EmptyChart message={movementScope === "upcoming" ? "Gastos futuros ficam de fora deste gráfico até serem pagos." : "Ainda não há movimentações para este filtro."} />}
        <div className="chart-legend">{showIncome && <span><i className="legend-dot legend-income" />Entradas</span>}{showExpenses && <span><i className="legend-dot legend-expense" />Despesas</span>}</div>
      </article>

      <article className="panel category-panel">
        <div className="panel-heading"><div><span className="eyebrow">DISTRIBUIÇÃO</span><h2>{isIncomeBreakdown ? "Entradas por categoria" : isUpcomingBreakdown ? "Gastos futuros por categoria" : "Despesas por categoria"}</h2><p>{isIncomeBreakdown ? "De onde vieram as receitas" : isUpcomingBreakdown ? "Valores que ainda vão sair da conta" : "O cuidado de cada parte da casa"}</p></div></div>
        {breakdown.length ? <>
          <div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={breakdown} dataKey="amount" nameKey="label" innerRadius={63} outerRadius={88} paddingAngle={3} stroke="none" cornerRadius={4}>{breakdown.map((entry) => <Cell key={entry.id} fill={entry.color} />)}</Pie><Tooltip formatter={(value) => [currency(Number(value)), "Total"]} contentStyle={{ border: "1px solid #e9ede8", borderRadius: 12, boxShadow: "0 8px 24px #263b2a12", fontSize: 12 }} /></PieChart></ResponsiveContainer><div className="donut-center"><span>{isIncomeBreakdown ? "Total de entradas" : isUpcomingBreakdown ? "A pagar" : "Total de despesas"}</span><strong>{currency(breakdownTotal)}</strong></div></div>
          <div className="category-legend">{breakdown.slice(0, 5).map((category) => <div className="category-legend-row" key={category.id}><span className="category-name"><i className="legend-dot" style={{ background: category.color }} />{category.label}</span><strong>{breakdownTotal ? Math.round(category.amount / breakdownTotal * 100) : 0}%</strong></div>)}</div>
        </> : <EmptyChart message="Não há categorias neste intervalo." />}
      </article>
    </section>

    <TransactionTable items={latestTransactions} categories={categories} onEdit={onEdit} onRemove={onRemove} onPay={onPay} heading="Últimos lançamentos" caption={`Movimentações em ${rangeLabel}.`} onSeeAll={onSeeAll} />
  </>;
}
