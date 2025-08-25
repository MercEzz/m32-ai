import type React from "react";
import { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
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
  type UserResponse,
} from "@/services/auth";
import { setAuth } from "@/store/authSlice";
import { toast } from "sonner";

export function AuthForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
        registerUser({ name: name.trim(), email, password }).unwrap();
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

  // ✅ common success handler
  const handleAuthSuccess = useCallback(
    (userData: UserResponse) => {
      if (userData?.sessionId) {
        dispatch(
          setAuth({
            user: {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              createdAt: userData.createdAt,
              updatedAt: userData.updatedAt,
            },
            sessionId: userData.sessionId,
          })
        );
        navigate("/dashboard");
      }
    },
    [dispatch, navigate]
  );

  // ✅ Initialize Google Identity Services
  useEffect(() => {
    const g = (window as any).google;
    if (g?.accounts?.id) {
      console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID as string, "clientt");
      g.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID as string,
        callback: (response: { credential: string }) => {
          googleSignIn({ idToken: response.credential });
        },
      });
      g.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        { theme: "filled_black", size: "large" } // customize as needed
      );
    }
  }, [googleSignIn]);

  // handle responses
  useEffect(() => {
    if (registerRes) {
      toast.success("Account created successfully");
      handleAuthSuccess(registerRes);
    }
    if (registerErr) {
      const err = registerErr as any;
      toast.error(err?.data?.error || err?.message || "Something went wrong");
    }
  }, [registerRes, registerErr, handleAuthSuccess]);

  useEffect(() => {
    if (signInRes) {
      toast.success("Signed in successfully");
      handleAuthSuccess(signInRes);
    }
    if (signInErr) {
      const err = signInErr as any;
      toast.error(err?.data?.error || err?.message || "Sign in failed");
    }
  }, [signInRes, signInErr, handleAuthSuccess]);

  useEffect(() => {
    if (googleRes) {
      toast.success("Google sign-in successful");
      handleAuthSuccess(googleRes);
    }
    if (googleErr) {
      const err = googleErr as any;
      toast.error(err?.data?.error || err?.message || "Google sign-in failed");
    }
  }, [googleRes, googleErr, handleAuthSuccess]);

  return (
    <Card className="w-md mx-auto bg-card border-border shadow-lg">
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
        {/* ✅ Google Sign-In button (Google renders it automatically) */}
        <div id="googleSignInDiv" className="flex justify-center mb-4"></div>

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
