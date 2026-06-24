import { useState } from "react";
import { useListTasks, useUpdateTask, useGetMyStats, getListTasksQueryKey, getGetMyStatsQueryKey } from "@workspace/api-client-react";
import type { Task } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LayoutGrid, List, CalendarDays, User } from "lucide-react";
import PriorityBadge from "@/components/tasks/PriorityBadge";
import StatusBadge from "@/components/tasks/StatusBadge";
import TaskDetailModal from "@/components/tasks/TaskDetailModal";
import { formatDate, isOverdue, cn } from "@/lib/utils";

const COLUMNS = ["To Do", "In Progress", "Done"] as const;
type Status = typeof COLUMNS[number];

export default function MyTasksPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const updateTask = useUpdateTask();

  const params = user?.uid ? { assigneeId: user.uid } : undefined;
  const { data: tasks, isLoading } = useListTasks(params, {
    query: { enabled: !!user?.uid, queryKey: getListTasksQueryKey(params) },
  });

  const { data: stats } = useGetMyStats({ query: { queryKey: getGetMyStatsQueryKey() } });

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col] = (tasks ?? []).filter((t) => t.status === col);
    return acc;
  }, {} as Record<Status, Task[]>);

  const handleStatusChange = (task: Task, newStatus: string) => {
    updateTask.mutate(
      { taskId: task.id, data: { status: newStatus as Status } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTasksQueryKey(params) });
          queryClient.invalidateQueries({ queryKey: getGetMyStatsQueryKey() });
          toast({ title: `Moved to ${newStatus}` });
        },
        onError: () => toast({ title: "Failed to update", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="p-6 space-y-5 max-w-6xl" data-testid="page-my-tasks">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">My Tasks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Tasks assigned to you</p>
        </div>
        <div className="flex items-center gap-1 border rounded-md p-0.5">
          <Button
            variant={view === "kanban" ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setView("kanban")}
            data-testid="button-view-kanban"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setView("list")}
            data-testid="button-view-list"
          >
            <List className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Mini stats banner */}
      {stats && (
        <div className="grid grid-cols-4 gap-3" data-testid="my-stats-banner">
          {[
            { label: "Total", value: stats.totalAssigned },
            { label: "To Do", value: stats.todo },
            { label: "In Progress", value: stats.inProgress },
            { label: "Done", value: stats.done },
          ].map(({ label, value }) => (
            <div key={label} className="bg-muted/50 rounded-lg p-3 text-center" data-testid={`stat-my-${label.toLowerCase().replace(/\s+/g, "-")}`}>
              <p className="text-xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Kanban View */}
      {view === "kanban" && (
        <div className="grid grid-cols-3 gap-4" data-testid="my-kanban-board">
          {COLUMNS.map((col) => (
            <div key={col} className="space-y-2" data-testid={`my-kanban-column-${col.toLowerCase().replace(/\s+/g, "-")}`}>
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold">{col}</h2>
                <span className="text-xs bg-muted border rounded px-1.5 py-0.5 font-mono">
                  {isLoading ? "—" : grouped[col].length}
                </span>
              </div>
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)
              ) : grouped[col].length === 0 ? (
                <div className="border rounded-lg py-8 flex items-center justify-center">
                  <p className="text-xs text-muted-foreground">Nothing here yet</p>
                </div>
              ) : (
                grouped[col].map((task) => (
                  <Card
                    key={task.id}
                    className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setDetailTaskId(task.id)}
                    data-testid={`my-kanban-card-${task.id}`}
                  >
                    <p className="text-sm font-medium mb-2">{task.title}</p>
                    <div className="flex items-center gap-1.5 mb-2">
                      <PriorityBadge priority={task.priority} />
                    </div>
                    {task.dueDate && (
                      <p className={cn("text-xs flex items-center gap-1", isOverdue(task.dueDate) && col !== "Done" ? "text-red-500" : "text-muted-foreground")}>
                        <CalendarDays className="h-3 w-3" /> {formatDate(task.dueDate)}
                      </p>
                    )}
                    {/* Status update inline */}
                    <div className="mt-2 pt-2 border-t" onClick={(e) => e.stopPropagation()}>
                      <Select value={task.status} onValueChange={(v) => handleStatusChange(task, v)}>
                        <SelectTrigger className="h-7 text-xs" data-testid={`select-my-task-status-${task.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="To Do">To Do</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </Card>
                ))
              )}
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="border rounded-lg overflow-hidden" data-testid="my-tasks-table">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Update Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (tasks ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground text-sm">
                    No tasks assigned to you yet.
                  </TableCell>
                </TableRow>
              ) : (
                (tasks ?? []).map((task) => (
                  <TableRow key={task.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setDetailTaskId(task.id)} data-testid={`row-my-task-${task.id}`}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell><StatusBadge status={task.status} /></TableCell>
                    <TableCell><PriorityBadge priority={task.priority} /></TableCell>
                    <TableCell className={cn("text-sm", isOverdue(task.dueDate) && task.status !== "Done" ? "text-red-500" : "text-muted-foreground")}>
                      {formatDate(task.dueDate)}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Select value={task.status} onValueChange={(v) => handleStatusChange(task, v)}>
                        <SelectTrigger className="h-7 w-36 text-xs" data-testid={`select-list-task-status-${task.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="To Do">To Do</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <TaskDetailModal taskId={detailTaskId} onClose={() => setDetailTaskId(null)} />
    </div>
  );
}
