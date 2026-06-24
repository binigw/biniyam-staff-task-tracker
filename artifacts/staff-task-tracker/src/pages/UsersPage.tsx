import { useListUsers, getListUsersQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function UsersPage() {
  const { data: users, isLoading } = useListUsers({ query: { queryKey: getListUsersQueryKey() } });

  return (
    <div className="p-6 space-y-5 max-w-4xl" data-testid="page-users">
      <div>
        <h1 className="text-xl font-semibold">Team Members</h1>
        <p className="text-sm text-muted-foreground mt-0.5">All users in your organization</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : (users ?? []).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border rounded-lg" data-testid="empty-users">
          <Users className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No team members found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" data-testid="grid-users">
          {(users ?? []).map((u) => (
            <Card key={u.id} className="p-4 flex items-center gap-3 border" data-testid={`card-user-${u.id}`}>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-base font-bold text-primary shrink-0">
                {u.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{u.displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                <Badge
                  variant={u.role === "admin" ? "default" : "secondary"}
                  className="mt-1 text-xs capitalize"
                  data-testid={`badge-user-role-${u.id}`}
                >
                  {u.role}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
