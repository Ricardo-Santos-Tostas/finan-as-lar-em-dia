import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./features/finance/styles/layout.css";
import "./features/finance/styles/filters.css";
import "./features/finance/styles/overview.css";
import "./features/finance/styles/transactions.css";
import "./features/finance/styles/categories.css";
import "./features/finance/styles/transaction-dialog.css";
import "./features/finance/styles/responsive.css";

createRoot(document.getElementById("root")!).render(<App />);
