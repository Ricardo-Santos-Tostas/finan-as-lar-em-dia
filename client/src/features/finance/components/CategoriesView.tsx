import { Baby, Bike, Home, PawPrint, Plus, Tags } from "lucide-react";
import { currency } from "../model/calculations";
import type { FinanceCategory, Transaction, TransactionType } from "../model/types";

type BreakdownItem = FinanceCategory & { amount: number };
type Props = {
  breakdown: BreakdownItem[];
  breakdownType: TransactionType;
  breakdownTotal: number;
  rangeLabel: string;
  transactions: Transaction[];
  onAddTransaction: () => void;
};

export default function CategoriesView({ breakdown, breakdownType, breakdownTotal, rangeLabel, transactions, onAddTransaction }: Props) {
  const isIncome = breakdownType === "income";
  return <section className="category-page">
    <div className="category-page-intro">
      <div><span className="eyebrow">VISÃO POR CATEGORIA</span><h2>{isIncome ? "De onde vêm as entradas" : "O orçamento tem muitas partes"}</h2><p>{isIncome ? `Categorias de receita em ${rangeLabel}.` : "Acompanhe os cuidados da casa, da criança, do pet e da moto em separado."}</p></div>
      <div className="category-total-badge"><span>{isIncome ? "Entradas no período" : "Despesas no período"}</span><strong>{currency(breakdownTotal)}</strong></div>
    </div>
    {breakdown.length ? <div className="category-card-grid">
      {breakdown.map((category) => {
        const percentage = breakdownTotal ? Math.round(category.amount / breakdownTotal * 100) : 0;
        const Icon = category.id === "child" ? Baby : category.id === "pet" ? PawPrint : category.id === "moto" ? Bike : category.id === "home" ? Home : Tags;
        const count = transactions.filter((item) => item.type === category.type && item.categoryId === category.id).length;
        return <article className="category-detail-card" key={category.id}>
          <div className="category-card-top"><span className="category-card-icon" style={{ background: `${category.color}1a`, color: category.color }}><Icon size={19} /></span><span className="category-percentage">{percentage}%</span></div>
          <h3>{category.label}</h3><strong className="category-card-amount">{currency(category.amount)}</strong>
          <div className="progress-track"><span style={{ width: `${percentage}%`, background: category.color }} /></div>
          <small>{count} lançamento(s)</small>
        </article>;
      })}
    </div> : <div className="empty-state"><span className="empty-icon"><Tags size={24} /></span><h3>Sem movimentações neste intervalo</h3><p>Ao adicionar um lançamento, ele aparecerá nesta visão.</p><button className="button button-primary" onClick={onAddTransaction}><Plus size={16} />Adicionar lançamento</button></div>}
  </section>;
}
