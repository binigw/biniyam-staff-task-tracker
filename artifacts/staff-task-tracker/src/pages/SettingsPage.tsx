import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Moon, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="p-6 space-y-5 max-w-2xl" data-testid="page-settings">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Account Info */}
      <Card className="border" data-testid="card-account">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
              {user?.displayName?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            <div>
              <p className="font-medium" data-testid="text-user-name">{user?.displayName ?? "Unknown"}</p>
              <p className="text-sm text-muted-foreground" data-testid="text-user-email">{user?.email}</p>
              <Badge variant={user?.role === "admin" ? "default" : "secondary"} className="mt-1 capitalize text-xs" data-testid="badge-user-role">
                {user?.role}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card className="border" data-testid="card-theme">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground mt-0.5">Currently using {theme} mode</p>
            </div>
            <Button variant="outline" onClick={toggleTheme} className="gap-2" data-testid="button-toggle-theme-settings">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              Switch to {theme === "dark" ? "Light" : "Dark"} Mode
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card className="border border-destructive/30" data-testid="card-danger-zone">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-destructive">Sign Out</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">End your current session</p>
            <Button variant="destructive" onClick={signOut} className="gap-2" data-testid="button-sign-out-settings">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
