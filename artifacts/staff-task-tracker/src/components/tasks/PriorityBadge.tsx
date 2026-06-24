import { cn, getPriorityColor } from "@/lib/utils";

export default function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", getPriorityColor(priority))} data-testid={`badge-priority-${priority.toLowerCase()}`}>
      {priority}
    </span>
  );
}
