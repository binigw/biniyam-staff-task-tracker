import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, ListChecks, KanbanSquare, Users, Settings, LogOut, CheckSquare, Sun, Moon, ChevronLeft, Menu
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const adminNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "All Tasks", icon: ListChecks },
  { href: "/kanban", label: "Kanban Board", icon: KanbanSquare },
  { href: "/users", label: "Team", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

const staffNav = [
  { href: "/my-tasks", label: "My Tasks", icon: ListChecks },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const nav = user?.role === "admin" ? adminNav : staffNav;

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-200",
        collapsed ? "w-16" : "w-56"
      )}
      data-testid="sidebar"
    >
      {/* Header */}
      <div className={cn("flex items-center h-14 px-3 border-b border-sidebar-border", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-sidebar-primary" />
            <span className="font-semibold text-sm tracking-tight">Staff Tracker</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => setCollapsed(!collapsed)}
          data-testid="button-toggle-sidebar"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5" data-testid="nav-main">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = location === href || (href !== "/" && location.startsWith(href));
          return (
            <Tooltip key={href} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link href={href}>
                  <a
                    className={cn(
                      "flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      collapsed && "justify-center"
                    )}
                    data-testid={`link-nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{label}</span>}
                  </a>
                </Link>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">{label}</TooltipContent>}
            </Tooltip>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-2 space-y-1">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size={collapsed ? "icon" : "sm"}
              className={cn("w-full text-sidebar-foreground hover:bg-sidebar-accent", !collapsed && "justify-start gap-3")}
              onClick={toggleTheme}
              data-testid="button-toggle-theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {!collapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
            </Button>
          </TooltipTrigger>
          {collapsed && <TooltipContent side="right">{theme === "dark" ? "Light Mode" : "Dark Mode"}</TooltipContent>}
        </Tooltip>

        {!collapsed && (
          <div className="px-2 py-1.5">
            <p className="text-xs font-medium text-sidebar-foreground truncate">{user?.displayName ?? user?.email}</p>
            <p className="text-xs text-sidebar-foreground/60 capitalize">{user?.role}</p>
          </div>
        )}

        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size={collapsed ? "icon" : "sm"}
              className={cn("w-full text-red-400 hover:bg-red-900/20 hover:text-red-300", !collapsed && "justify-start gap-3")}
              onClick={signOut}
              data-testid="button-sign-out"
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sign Out</span>}
            </Button>
          </TooltipTrigger>
          {collapsed && <TooltipContent side="right">Sign Out</TooltipContent>}
        </Tooltip>
      </div>
    </aside>
  );
}
