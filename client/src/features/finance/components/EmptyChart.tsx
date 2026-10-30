import { ReceiptText } from "lucide-react";

type Props = { message: string };

export default function EmptyChart({ message }: Props) {
  return <div className="empty-chart"><span className="empty-chart-icon"><ReceiptText size={18} /></span><p>{message}</p></div>;
}
