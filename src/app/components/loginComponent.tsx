"use client";
import { useAuth } from "@/hooks/zustand";
import { validatePassword, validateUser, terminateSessions } from "@/server/action";
import { Eye, EyeOff, Mail, Lock, Shield, Zap, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Loader } from "../app/components/loader";

import { ExtendedAuthData } from "@/types/api";

export const LoginComponent = () => {
  const [eyeOpen, setEyeOpen] = useState(false);
  const { error, setError, loading, setLoading, setEmail, email } = useAuth();

  const safeError = typeof error === 'string' ? error : '';

  useEffect(() => {
    window.localStorage.clear();
  }, []);

  const HandleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const form = new FormData(e.currentTarget);
      const hash1 = form.get("name") as string;
      const hash2 = form.get("password") as string;

      if (hash1 && hash1.length !== 0) {
        const email = hash1.includes("@srmist.edu.in")
          ? hash1
          : `${hash1}@srmist.edu.in`;
        const { res } = await validateUser(email.toLowerCase());

        if (res.error) {
          setError(typeof res.errorReason === 'string' ? res.errorReason : 'Authentication failed');
          setLoading(false);
          return;
        }

        if ('data' in res && res.data?.status_code === 400) {
          setError(typeof res.data?.message === 'string' ? res.data.message : 'Invalid credentials');
          setLoading(false);
          return;
        }
        if ('data' in res && res.data?.status_code === 500) {
          setError("You reached Maximum Login");
          setLoading(false);
          return;
        }

        if ('data' in res && res.data?.digest && res.data?.identifier) {
          setEmail({
            mail: email.toLowerCase(),
            digest: res.data.digest as string,
            identifier: res.data.identifier as string,
          });
          setLoading(false);
          return;
        } else {
          setError("Invalid response from server");
          setLoading(false);
          return;
        }
      }

      if (hash2 && hash2.length !== 0) {
        if (!email.digest || !email.identifier) {
          setError("Please enter your email first");
          setLoading(false);
          return;
        }

        const { res } = await validatePassword({
          digest: email.digest,
          identifier: email.identifier,
          password: hash2,
          email: email.mail,
        });

        if (res.error) {
          setError(typeof res.errorReason === 'string' ? res.errorReason : 'Authentication failed');
          setLoading(false);
          return;
        }

        // Auto-terminate concurrent sessions and retry
        if ('data' in res && (res.data as ExtendedAuthData)?.isConcurrentLimit) {
          setError("Terminating other sessions, retrying...");
          await terminateSessions({
            flowId: (res.data as ExtendedAuthData).flowId ?? null,
            identifier: email.identifier,
            digest: email.digest,
          });
          // Retry login after termination
          const { res: res2 } = await validatePassword({
            digest: email.digest,
            identifier: email.identifier,
            password: hash2,
            email: email.mail,
          });
          if ('data' in res2 && res2.isAuthenticated && typeof res2.data?.cookies === "string") {
            Cookies.set("token", res2.data.cookies, { expires: 30, path: "/" });
            Cookies.set("user", email.mail, { expires: 30, path: "/" });
            return (window.location.href = "/app/timetable");
          }
          setError("Failed to sign in after terminating sessions. Please try again.");
          setLoading(false);
          return;
        }

        if ('data' in res && (res.data?.statusCode === 500 || res.data?.captcha?.required)) {
          if (res.data?.captcha?.required) {
            setError(typeof res.data.message === 'string' ? res.data.message : 'Captcha required');
            setLoading(false);
            return;
          }
          setError(typeof res.data?.message === 'string' ? res.data?.message : 'Server error');
          setLoading(false);
          return;
        }

        if ('data' in res && res.isAuthenticated && typeof res.data?.cookies === "string") {
          Cookies.set("token", res.data.cookies, { expires: 30, path: "/" });
          Cookies.set("user", email.mail, { expires: 30, path: "/" });
          return (window.location.href = "/app/timetable");
        } else {
          setError("Authentication failed");
          setLoading(false);
          return;
        }
      }

      setError("Please enter your credentials");
      setLoading(false);
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 lg:px-8 py-8 relative overflow-hidden min-h-[calc(100vh-5rem)] bg-background">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center relative z-10">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col gap-8">
          <div className="space-y-6">
            <h1 className="text-6xl font-bold elegant-title leading-tight text-foreground">
              BhagyaSreeBorse
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Your complete academic companion for SRM students.
              <span className="block mt-2 font-semibold text-foreground">
                Manage, Track, Excel.
              </span>
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 border border-border">
                <Shield className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">Secure & Private</h3>
                <p className="text-sm text-muted-foreground">Your data is securely authenticated</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 border border-border">
                <Zap className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground">Instant access to all your academic data</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 border border-border">
                <Sparkles className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">Smart Features</h3>
                <p className="text-sm text-muted-foreground">Attendance tracking and SGPA prediction</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="relative w-full max-w-md mx-auto lg:mx-0">
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-4xl font-bold elegant-title mb-2 text-foreground">
              BhagyaSreeBorse
            </h1>
            <p className="text-muted-foreground text-sm">
              Your academic companion
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-sm">
            <div className="p-6 sm:p-8">
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold elegant-title mb-2 text-foreground">
                  Sign In
                </h2>
                <p className="text-muted-foreground text-sm">Access your academic dashboard</p>
              </div>

              <form onSubmit={HandleSubmit} className="space-y-6">
                {email?.digest.length === 0 && (
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-semibold text-foreground">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="your.email@srmist.edu.in"
                        className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl bg-secondary border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-all text-sm"
                        autoComplete="email"
                        autoFocus
                        required
                      />
                    </div>
                  </div>
                )}

                {email?.digest.length !== 0 && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground">
                        Email Address
                      </label>
                      <div className="flex items-center gap-3 px-4 py-3 sm:py-4 rounded-xl bg-secondary border border-border">
                        <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        <span className="flex-1 text-foreground font-medium truncate text-sm">{email.mail}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEmail({ mail: "", digest: "", identifier: "" });
                            setError("");
                          }}
                          className="text-xs px-3 py-1.5 rounded-md bg-background border border-border hover:bg-accent text-foreground transition-colors flex-shrink-0"
                        >
                          Change
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="password" className="block text-sm font-semibold text-foreground">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                          <Lock className="w-5 h-5" />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={eyeOpen ? "text" : "password"}
                          placeholder="Enter your password"
                          className="w-full pl-12 pr-12 py-3 sm:py-4 rounded-xl bg-secondary border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-all text-sm"
                          autoComplete="current-password"
                          autoFocus
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setEyeOpen((prev) => !prev)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {eyeOpen ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {safeError && safeError.length > 0 && (
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                    <p className="text-destructive text-sm text-center font-medium">{safeError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 sm:py-4 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center justify-center gap-2 text-sm sm:text-base">
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <span>{email?.digest.length === 0 ? "Continue" : "Sign In"}</span>
                    )}
                  </span>
                </button>

                <div className="text-center pt-2">
                  <a
                    href="https://academia.srmist.edu.in/reset"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                  >
                    Forgot your password?
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;
