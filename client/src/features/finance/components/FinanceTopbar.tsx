import { Menu } from "lucide-react";

type Props = { title: string; onOpenMenu: () => void };

export default function FinanceTopbar({ title, onOpenMenu }: Props) {
  return <header className="topbar">
    <button className="icon-button menu-trigger" onClick={onOpenMenu} aria-label="Abrir menu"><Menu size={20} /></button>
    <div className="breadcrumb"><span>Minha casa</span><span className="breadcrumb-slash">/</span><strong>{title}</strong></div>
    <div className="topbar-right">
      <span className="today-label">{new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}</span>
      <button className="avatar-small" aria-label="Perfil da família">L</button>
    </div>
  </header>;
}
