import { cn } from "@/lib/utils";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

type Status = "pending" | "analyzing" | "completed" | "failed" | string;

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const styles = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    analyzing: "bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse",
    completed: "bg-primary/10 text-primary border-primary/20",
    failed: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const icons = {
    pending: <Clock className="w-3.5 h-3.5 mr-1.5" />,
    analyzing: <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />,
    completed: <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />,
    failed: <XCircle className="w-3.5 h-3.5 mr-1.5" />,
  };

  const currentStyle = styles[status as keyof typeof styles] || "bg-secondary text-muted-foreground";
  const Icon = icons[status as keyof typeof icons] || <Clock className="w-3.5 h-3.5 mr-1.5" />;

  return (
    <div className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border uppercase tracking-wider",
      currentStyle,
      className
    )}>
      {Icon}
      {status}
    </div>
  );
}
