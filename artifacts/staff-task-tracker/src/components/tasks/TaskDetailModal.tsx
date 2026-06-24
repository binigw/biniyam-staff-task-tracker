import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useGetTask, useListComments, useAddComment, useUpdateTask,
  getGetTaskQueryKey, getListCommentsQueryKey, getListTasksQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";
import { formatDate, isOverdue, relativeTime, cn } from "@/lib/utils";
import { CalendarDays, User, MessageSquare, Send } from "lucide-react";

interface Props {
  taskId: string | null;
  onClose: () => void;
}

export default function TaskDetailModal({ taskId, onClose }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const { data: task, isLoading: taskLoading } = useGetTask(taskId ?? "", {
    query: { enabled: !!taskId, queryKey: getGetTaskQueryKey(taskId ?? "") },
  });
  const { data: comments, isLoading: commentsLoading } = useListComments(taskId ?? "", {
    query: { enabled: !!taskId, queryKey: getListCommentsQueryKey(taskId ?? "") },
  });
  const addComment = useAddComment();
  const updateTask = useUpdateTask();

  const handleStatusChange = (newStatus: string) => {
    if (!task) return;
    updateTask.mutate(
      { taskId: task.id, data: { status: newStatus as "To Do" | "In Progress" | "Done" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetTaskQueryKey(task.id) });
          queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
          toast({ title: "Status updated" });
        },
        onError: () => toast({ title: "Failed to update status", variant: "destructive" }),
      }
    );
  };

  const handleAddComment = () => {
    if (!taskId || !comment.trim()) return;
    addComment.mutate(
      { taskId, data: { text: comment.trim() } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCommentsQueryKey(taskId) });
          setComment("");
          toast({ title: "Comment added" });
        },
        onError: () => toast({ title: "Failed to add comment", variant: "destructive" }),
      }
    );
  };

  return (
    <Dialog open={!!taskId} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col" data-testid="modal-task-detail">
        <DialogHeader>
          <DialogTitle>
            {taskLoading ? <Skeleton className="h-5 w-48" /> : task?.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {taskLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : task ? (
            <>
              {/* Meta */}
              <div className="flex flex-wrap gap-2 items-center">
                <PriorityBadge priority={task.priority} />
                <StatusBadge status={task.status} />
                <span className={cn("flex items-center gap-1 text-xs", isOverdue(task.dueDate) && task.status !== "Done" ? "text-red-500" : "text-muted-foreground")}>
                  <CalendarDays className="h-3.5 w-3.5" /> {formatDate(task.dueDate)}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="h-3.5 w-3.5" /> {task.assigneeName}
                </span>
              </div>

              {task.description && (
                <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-task-description">
                  {task.description}
                </p>
              )}

              {/* Status Update */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Update Status:</span>
                <Select value={task.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-36 h-8" data-testid="select-task-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="To Do">To Do</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Comments */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4" /> Comments
                </h3>
                {commentsLoading ? (
                  <div className="space-y-2">
                    {[0,1].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : (comments ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center" data-testid="text-no-comments">
                    No comments yet. Be the first to comment.
                  </p>
                ) : (
                  <div className="space-y-3" data-testid="list-comments">
                    {(comments ?? []).map((c) => (
                      <div key={c.id} className="flex gap-2.5" data-testid={`comment-${c.id}`}>
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0 mt-0.5">
                          {c.authorName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">{c.authorName}</span>
                            <span className="text-xs text-muted-foreground">{relativeTime(c.createdAt)}</span>
                          </div>
                          <p className="text-sm text-foreground/90">{c.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment */}
                <div className="flex gap-2 pt-1">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0 mt-1">
                    {user?.displayName?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 flex gap-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={2}
                      className="resize-none text-sm"
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
                      data-testid="input-comment"
                    />
                    <Button
                      size="icon"
                      className="h-9 w-9 shrink-0 self-end"
                      onClick={handleAddComment}
                      disabled={!comment.trim() || addComment.isPending}
                      data-testid="button-submit-comment"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
