import type React from "react";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import {
  useRegisterUserMutation,
  useSignInUserMutation,
  useGoogleSignInMutation,
} from "@/services/auth";
import { toast } from "sonner";

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string>("");

  const [
    registerUser,
    { isLoading: isRegistering, data: registerRes, error: registerErr },
  ] = useRegisterUserMutation();
  const [
    signInUser,
    { isLoading: isSigningIn, data: signInRes, error: signInErr },
  ] = useSignInUserMutation();
  const [
    googleSignIn,
    { isLoading: isGoogleSigningIn, data: googleRes, error: googleErr },
  ] = useGoogleSignInMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    try {
      if (isLogin) {
        signInUser({ email, password }).unwrap();
      } else {
        if (!name.trim()) {
          setFormError("Name is required");
          return;
        }
        if (password !== confirmPassword) {
          setFormError("Passwords do not match");
          return;
        }
        registerUser({
          name: name.trim(),
          email,
          password,
        }).unwrap();
      }
    } catch (err: unknown) {
      let message = "Request failed";
      if (typeof err === "object" && err !== null) {
        const e = err as {
          data?: { error?: string; message?: string };
          error?: string;
        };
        message = e?.data?.error || e?.data?.message || e?.error || message;
      }
      setFormError(message);
    }
  };

  // Google Identity Services minimal types and handlers
  type GoogleCredential = { credential: string };
  type GoogleInitOptions = {
    client_id: string;
    callback: (response: GoogleCredential) => void;
  };
  type GoogleObject = {
    accounts: {
      id: { initialize: (o: GoogleInitOptions) => void; prompt: () => void };
    };
  };

  const handleGoogleCredential = useCallback(
    async (resp: GoogleCredential) => {
      setFormError("");
      try {
        await googleSignIn({ idToken: resp.credential }).unwrap();
      } catch (err: unknown) {
        let message = "Google sign-in failed";
        if (typeof err === "object" && err !== null) {
          const e = err as {
            data?: { error?: string; message?: string };
            error?: string;
          };
          message = e?.data?.error || e?.data?.message || e?.error || message;
        }
        setFormError(message);
      }
    },
    [googleSignIn]
  );

  useEffect(() => {
    let mounted = true;
    const ensureScript = async () => {
      const w = window as unknown as { google?: GoogleObject };
      if (!w.google) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://accounts.google.com/gsi/client";
          s.async = true;
          s.defer = true;
          s.onload = () => resolve();
          s.onerror = () => reject(new Error("Failed to load Google script"));
          document.body.appendChild(s);
        });
      }
      if (!mounted) return;
      (
        window as unknown as { google?: GoogleObject }
      ).google?.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID as string,
        callback: handleGoogleCredential,
      });
    };
    void ensureScript();
    return () => {
      mounted = false;
    };
  }, [handleGoogleCredential]);

  const handleGoogleAuth = () => {
    (
      window as unknown as { google?: GoogleObject }
    ).google?.accounts.id.prompt();
  };

  useEffect(() => {
    if (registerRes) {
      toast.success("Success");
    }
    if (registerErr) {
      const err = registerErr as
        | import("@reduxjs/toolkit").SerializedError
        | import("@reduxjs/toolkit/query").FetchBaseQueryError;
      const message =
        (err as import("@reduxjs/toolkit").SerializedError).message ||
        (
          err as import("@reduxjs/toolkit/query").FetchBaseQueryError & {
            data?: { error?: string };
          }
        ).data?.error ||
        "Something went wrong";
      toast.error(message);
    }
  }, [registerRes, registerErr]);
  useEffect(() => {
    if (signInRes) {
      toast.success("Signed in successfully");
    }
    if (signInErr) {
      const err = signInErr as
        | import("@reduxjs/toolkit").SerializedError
        | import("@reduxjs/toolkit/query").FetchBaseQueryError;
      const m =
        (err as import("@reduxjs/toolkit").SerializedError).message ||
        (
          err as import("@reduxjs/toolkit/query").FetchBaseQueryError & {
            data?: { error?: string };
          }
        ).data?.error ||
        "Sign in failed";
      toast.error(m);
    }
  }, [signInRes, signInErr]);
  useEffect(() => {
    if (googleRes) {
      toast.success("Google sign-in successful");
    }
    if (googleErr) {
      const err = googleErr as
        | import("@reduxjs/toolkit").SerializedError
        | import("@reduxjs/toolkit/query").FetchBaseQueryError;
      const m =
        (err as import("@reduxjs/toolkit").SerializedError).message ||
        (
          err as import("@reduxjs/toolkit/query").FetchBaseQueryError & {
            data?: { error?: string };
          }
        ).data?.error ||
        "Google sign-in failed";
      toast.error(m);
    }
  }, [googleRes, googleErr]);

  return (
    <Card className="w-full bg-card border-border shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-semibold text-card-foreground">
          {isLogin ? "Welcome back" : "Create account"}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {isLogin
            ? "Enter your credentials to access your account"
            : "Enter your information to create a new account"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Button
          variant="outline"
          className="w-full h-11 border-border hover:bg-accent hover:text-accent-foreground bg-transparent"
          onClick={handleGoogleAuth}
          disabled={isGoogleSigningIn}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-card-foreground">
                Name
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-input border-border focus:ring-ring"
                  required
                />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-card-foreground">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-input border-border focus:ring-ring"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-card-foreground">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-input border-border focus:ring-ring"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-card-foreground">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 bg-input border-border focus:ring-ring"
                  required
                />
              </div>
            </div>
          )}

          {isLogin && (
            <div className="flex justify-end">
              <Button
                variant="link"
                className="px-0 text-secondary hover:text-secondary/80"
              >
                Forgot password?
              </Button>
            </div>
          )}

          {formError && (
            <div className="text-sm text-red-600" role="alert">
              {formError}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isRegistering || isSigningIn}
          >
            {isLogin ? "Sign in" : "Create account"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Your data is protected with enterprise-grade security</span>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <Button
            variant="link"
            className="px-0 text-primary hover:text-primary/80"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign up" : "Sign in"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
