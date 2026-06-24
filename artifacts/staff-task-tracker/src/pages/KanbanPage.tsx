import { useState } from "react";
import { useListTasks, useUpdateTask, getListTasksQueryKey } from "@workspace/api-client-react";
import type { Task } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PriorityBadge from "@/components/tasks/PriorityBadge";
import StatusBadge from "@/components/tasks/StatusBadge";
import TaskDetailModal from "@/components/tasks/TaskDetailModal";
import TaskFormModal from "@/components/tasks/TaskFormModal";
import { formatDate, isOverdue, cn } from "@/lib/utils";
import { CalendarDays, User } from "lucide-react";

const COLUMNS = ["To Do", "In Progress", "Done"] as const;
type Status = typeof COLUMNS[number];

const columnColors: Record<Status, string> = {
  "To Do": "border-t-slate-400",
  "In Progress": "border-t-blue-500",
  "Done": "border-t-green-500",
};

const columnBg: Record<Status, string> = {
  "To Do": "bg-slate-50 dark:bg-slate-900/30",
  "In Progress": "bg-blue-50 dark:bg-blue-900/10",
  "Done": "bg-green-50 dark:bg-green-900/10",
};

export default function KanbanPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const updateTask = useUpdateTask();

  const { data: tasks, isLoading } = useListTasks(undefined, { query: { queryKey: getListTasksQueryKey() } });

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col] = (tasks ?? []).filter((t) => t.status === col);
    return acc;
  }, {} as Record<Status, Task[]>);

  const moveTask = (task: Task, newStatus: Status) => {
    updateTask.mutate(
      { taskId: task.id, data: { status: newStatus } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
          toast({ title: `Moved to ${newStatus}` });
        },
        onError: () => toast({ title: "Failed to update status", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="p-6 flex flex-col h-full" data-testid="page-kanban">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold">Kanban Board</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Visual overview of all tasks by status</p>
        </div>
        <Button onClick={() => setFormOpen(true)} data-testid="button-create-task-kanban">
          <Plus className="h-4 w-4 mr-2" /> New Task
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 flex-1 min-h-0" data-testid="kanban-board">
        {COLUMNS.map((col) => (
          <div key={col} className="flex flex-col min-h-0" data-testid={`kanban-column-${col.toLowerCase().replace(/\s+/g, "-")}`}>
            <div className={cn("rounded-lg border border-t-2 flex flex-col", columnColors[col], columnBg[col])}>
              <div className="px-3 py-2.5 border-b flex items-center justify-between">
                <h2 className="text-sm font-semibold">{col}</h2>
                <span className="text-xs bg-background border rounded px-1.5 py-0.5 font-mono font-medium">
                  {isLoading ? "—" : grouped[col].length}
                </span>
              </div>
              <div className="p-2 space-y-2 overflow-y-auto flex-1">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                  ))
                ) : grouped[col].length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-xs text-muted-foreground">No tasks here</p>
                  </div>
                ) : (
                  grouped[col].map((task) => (
                    <Card
                      key={task.id}
                      className="p-3 cursor-pointer hover:shadow-md transition-shadow border bg-card"
                      onClick={() => setDetailTaskId(task.id)}
                      data-testid={`kanban-card-${task.id}`}
                    >
                      <p className="text-sm font-medium leading-snug mb-2">{task.title}</p>
                      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                        <PriorityBadge priority={task.priority} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" /> {task.assigneeName}
                        </span>
                        {task.dueDate && (
                          <span className={cn("flex items-center gap-1 text-xs", isOverdue(task.dueDate) && task.status !== "Done" ? "text-red-500" : "text-muted-foreground")}>
                            <CalendarDays className="h-3 w-3" /> {formatDate(task.dueDate)}
                          </span>
                        )}
                      </div>
                      {/* Move buttons */}
                      <div className="flex gap-1 mt-2 pt-2 border-t" onClick={(e) => e.stopPropagation()}>
                        {COLUMNS.filter((c) => c !== col).map((c) => (
                          <button
                            key={c}
                            className="text-xs text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-muted transition-colors"
                            onClick={() => moveTask(task, c)}
                            data-testid={`button-move-${task.id}-to-${c.toLowerCase().replace(/\s+/g, "-")}`}
                          >
                            &rarr; {c}
                          </button>
                        ))}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <TaskDetailModal taskId={detailTaskId} onClose={() => setDetailTaskId(null)} />
      <TaskFormModal open={formOpen} onClose={() => setFormOpen(false)} task={null} />
    </div>
  );
}
