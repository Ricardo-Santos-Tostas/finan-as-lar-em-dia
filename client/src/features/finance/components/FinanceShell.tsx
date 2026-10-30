import type { ReactNode } from "react";
import type { FinanceView } from "../types";
import FinanceSidebar from "./FinanceSidebar";
import FinanceTopbar from "./FinanceTopbar";

type Props = {
  title: string;
  view: FinanceView;
  movementCount: number;
  mobileNavOpen: boolean;
  onViewChange: (view: FinanceView) => void;
  onOpenMenu: () => void;
  onCloseMenu: () => void;
  children: ReactNode;
};

export default function FinanceShell({ title, view, movementCount, mobileNavOpen, onViewChange, onOpenMenu, onCloseMenu, children }: Props) {
  return <div className="app-shell">
    <FinanceSidebar view={view} movementCount={movementCount} mobileNavOpen={mobileNavOpen} onViewChange={onViewChange} onClose={onCloseMenu} />
    <main className="main-content">
      <FinanceTopbar title={title} onOpenMenu={onOpenMenu} />
      <div className="page-wrap">
        {children}
        <footer className="page-footer"><span>Feito para cuidar do que importa em casa.</span><span className="footer-brand">lar em dia<span>.</span></span></footer>
      </div>
    </main>
  </div>;
}
