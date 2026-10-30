import { CircleHelp, Home, ReceiptText, Tags, X } from "lucide-react";
import type { FinanceView } from "../types";

type Props = {
  view: FinanceView;
  movementCount: number;
  mobileNavOpen: boolean;
  onViewChange: (view: FinanceView) => void;
  onClose: () => void;
};

export default function FinanceSidebar({ view, movementCount, mobileNavOpen, onViewChange, onClose }: Props) {
  return <>
    {mobileNavOpen && <button className="mobile-scrim" onClick={onClose} aria-label="Fechar menu" />}
    <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
      <div className="brand-lockup">
        <span className="brand-mark"><Home size={20} strokeWidth={2.3} /></span>
        <span className="brand-name">lar em dia<span className="brand-period">.</span><small>FINANÇAS DA CASA</small></span>
        <button className="icon-button sidebar-close" onClick={onClose} aria-label="Fechar menu"><X size={18} /></button>
      </div>
      <div className="side-label">SEU ESPAÇO</div>
      <nav className="side-nav" aria-label="Navegação principal">
        <button className={`nav-item ${view === "overview" ? "selected" : ""}`} onClick={() => onViewChange("overview")}><span className="nav-icon"><Home size={18} /></span>Visão geral</button>
        <button className={`nav-item ${view === "transactions" ? "selected" : ""}`} onClick={() => onViewChange("transactions")}><span className="nav-icon"><ReceiptText size={18} /></span>Lançamentos<span className="nav-count">{movementCount}</span></button>
        <button className={`nav-item ${view === "categories" ? "selected" : ""}`} onClick={() => onViewChange("categories")}><span className="nav-icon"><Tags size={18} /></span>Categorias</button>
      </nav>
      <div className="sidebar-bottom">
        <div className="family-note-icon"><CircleHelp size={17} /></div>
        <div><strong>Um passo de cada vez</strong><p>Pequenos cuidados também fazem parte do plano.</p></div>
      </div>
      <div className="sidebar-profile"><div className="profile-avatar">L</div><div className="profile-copy"><strong>Minha família</strong><span>Visão compartilhada</span></div><span className="profile-dot" /></div>
    </aside>
  </>;
}
