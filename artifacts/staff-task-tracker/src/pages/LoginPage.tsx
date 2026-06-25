import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckSquare, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Strip invisible unicode chars (zero-width spaces, LRM, BOM, etc.) that get
// copied in from messages before validating
function sanitizeEmail(v: string) {
  return v.replace(/[\u0000-\u001F\u200B-\u200F\u202A-\u202E\uFEFF]/g, "").trim();
}

const schema = z.object({
  email: z.string().transform(sanitizeEmail).pipe(z.string().email("Enter a valid email")),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { signIn, user } = useAuth();
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setLocation(user.role === "admin" ? "/dashboard" : "/my-tasks");
    }
  }, [user, setLocation]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    // Strip invisible unicode chars that get copied in from messages
    const email = sanitizeEmail(values.email);
    const password = values.password.replace(/[\u0000-\u001F\u200B-\u200F\u202A-\u202E\uFEFF]/g, "").trim();
    try {
      await signIn(email, password);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "";
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        setError("Incorrect email or password. Please check and try again.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please wait a few minutes and try again.");
      } else if (code === "auth/user-disabled") {
        setError("This account has been disabled. Contact your administrator.");
      } else if (code === "auth/invalid-email") {
        setError("Invalid email format. Please check your email address.");
      } else {
        setError(`Sign in failed (${code || "unknown error"}). Please try again.`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" data-testid="page-login">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold tracking-tight">Staff Tracker</span>
          </div>
          <p className="text-sm text-muted-foreground">Team task management for small businesses</p>
        </div>

        <Card className="border shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="text" inputMode="email" autoComplete="email" placeholder="you@company.com" {...field} data-testid="input-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          data-testid="input-password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                {error && (
                  <p className="text-sm text-destructive" data-testid="text-login-error">{error}</p>
                )}
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting} data-testid="button-sign-in">
                  {form.formState.isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
