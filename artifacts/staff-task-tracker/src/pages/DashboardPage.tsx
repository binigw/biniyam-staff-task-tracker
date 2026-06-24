import { CheckCircle2, Clock, AlertTriangle, ListTodo } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetOverviewStats, useListUsers, getGetOverviewStatsQueryKey, getListUsersQueryKey } from "@workspace/api-client-react";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useGetOverviewStats({ query: { queryKey: getGetOverviewStatsQueryKey() } });
  const { data: users, isLoading: usersLoading } = useListUsers({ query: { queryKey: getListUsersQueryKey() } });

  const statCards = [
    { label: "Total Tasks", value: stats?.totalTasks ?? 0, icon: ListTodo, color: "text-primary" },
    { label: "Active", value: stats?.activeTasks ?? 0, icon: Clock, color: "text-amber-500" },
    { label: "Completed", value: stats?.completedTasks ?? 0, icon: CheckCircle2, color: "text-green-500" },
    { label: "Overdue", value: stats?.overdueTasks ?? 0, icon: AlertTriangle, color: "text-red-500" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-6xl" data-testid="page-dashboard">
      <div>
        <h1 className="text-xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Team task summary and workload distribution</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border" data-testid={`card-stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="text-2xl font-bold">{value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Breakdown */}
        <Card className="border" data-testid="card-priority-breakdown">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tasks by Priority</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {statsLoading ? (
              <div className="space-y-3">
                {[0,1,2].map(i => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : (
              [
                { label: "High", value: stats?.byPriority.High ?? 0, color: "bg-red-500", total: stats?.totalTasks ?? 1 },
                { label: "Medium", value: stats?.byPriority.Medium ?? 0, color: "bg-amber-500", total: stats?.totalTasks ?? 1 },
                { label: "Low", value: stats?.byPriority.Low ?? 0, color: "bg-green-500", total: stats?.totalTasks ?? 1 },
              ].map(({ label, value, color, total }) => (
                <div key={label} className="space-y-1" data-testid={`row-priority-${label.toLowerCase()}`}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{label}</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                  <Progress value={total > 0 ? (value / total) * 100 : 0} className="h-2" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Team Workload */}
        <Card className="border" data-testid="card-team-workload">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Team Workload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {statsLoading || usersLoading ? (
              <div className="space-y-3">
                {[0,1,2].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (stats?.byAssignee ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No task assignments yet</p>
            ) : (
              (stats?.byAssignee ?? []).map((a) => {
                const pct = a.total > 0 ? (a.completed / a.total) * 100 : 0;
                return (
                  <div key={a.assigneeId} className="space-y-1" data-testid={`row-assignee-${a.assigneeId}`}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{a.assigneeName}</span>
                      <span className="text-muted-foreground text-xs">{a.completed}/{a.total} done</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Card className="border" data-testid="card-team-members">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Team Members ({users?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="space-y-2">
              {[0,1,2].map(i => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {(users ?? []).map((u) => (
                <div key={u.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/50" data-testid={`item-user-${u.id}`}>
                  <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                    {u.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{u.displayName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{u.role}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
