import { useState } from "react";
import { useListTasks, useDeleteTask, getListTasksQueryKey } from "@workspace/api-client-react";
import type { Task } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import PriorityBadge from "@/components/tasks/PriorityBadge";
import StatusBadge from "@/components/tasks/StatusBadge";
import TaskFormModal from "@/components/tasks/TaskFormModal";
import TaskDetailModal from "@/components/tasks/TaskDetailModal";
import { formatDate, isOverdue, cn } from "@/lib/utils";

export default function TasksPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const deleteTask = useDeleteTask();

  const params = {
    ...(filterStatus !== "all" ? { status: filterStatus as Task["status"] } : {}),
    ...(filterPriority !== "all" ? { priority: filterPriority as Task["priority"] } : {}),
  };

  const { data: tasks, isLoading } = useListTasks(params, { query: { queryKey: getListTasksQueryKey(params) } });

  const filtered = (tasks ?? []).filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.assigneeName.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = () => {
    if (!deleteId) return;
    deleteTask.mutate({ taskId: deleteId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
        toast({ title: "Task deleted" });
        setDeleteId(null);
      },
      onError: () => toast({ title: "Failed to delete task", variant: "destructive" }),
    });
  };

  return (
    <div className="p-6 space-y-4 max-w-6xl" data-testid="page-tasks">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">All Tasks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage and track all team tasks</p>
        </div>
        <Button onClick={() => { setEditTask(null); setFormOpen(true); }} data-testid="button-create-task">
          <Plus className="h-4 w-4 mr-2" /> New Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search tasks or assignees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
          data-testid="input-search-tasks"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36" data-testid="select-filter-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="To Do">To Do</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Done">Done</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-36" data-testid="select-filter-priority">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden" data-testid="table-tasks">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Title</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                  No tasks found. Create your first task to get started.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((task) => (
                <TableRow
                  key={task.id}
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => setDetailTaskId(task.id)}
                  data-testid={`row-task-${task.id}`}
                >
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{task.assigneeName}</TableCell>
                  <TableCell><StatusBadge status={task.status} /></TableCell>
                  <TableCell><PriorityBadge priority={task.priority} /></TableCell>
                  <TableCell className={cn("text-sm", isOverdue(task.dueDate) && task.status !== "Done" ? "text-red-500 font-medium" : "text-muted-foreground")}>
                    {formatDate(task.dueDate)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditTask(task); setFormOpen(true); }} data-testid={`button-edit-task-${task.id}`}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(task.id)} data-testid={`button-delete-task-${task.id}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TaskFormModal open={formOpen} onClose={() => { setFormOpen(false); setEditTask(null); }} task={editTask} />
      <TaskDetailModal taskId={detailTaskId} onClose={() => setDetailTaskId(null)} />

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent data-testid="dialog-delete-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The task will be permanently deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" data-testid="button-confirm-delete">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
