"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";

import KeplerLogo from "@/components/kepler/KeplerLogo";
import AuthLoadingScreen from "@/components/kepler/AuthLoadingScreen";
import { useAuth } from "@/lib/kepler/AuthProvider";
import { formatAuthErrorMessage } from "@/lib/kepler/authErrors";

type Mode = "signIn" | "signUp";

const inputClass = `
  mt-2.5
  h-[52px]
  w-full
  rounded-lg
  border
  border-slate-200
  bg-white
  px-4
  text-[16px]
  text-[var(--kepler-ink)]
  outline-none
  transition-colors
  placeholder:text-slate-400
  hover:border-slate-300
  focus:border-[var(--kepler-navy)]
  focus:ring-2
  focus:ring-[var(--kepler-navy)]/10
  disabled:cursor-not-allowed
  disabled:bg-slate-50
  disabled:text-slate-400
  sm:text-[14px]
`;

export default function LoginPage() {
  const { user, loading, configured, signIn, signUp } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("signIn");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmationAttempted, setConfirmationAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmationError = mode === "signUp" && confirmationAttempted
    ? !confirmPassword
      ? "Please confirm your password."
      : password !== confirmPassword
        ? "Passwords do not match."
        : null
    : null;

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  if (loading || user) {
    return <AuthLoadingScreen />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (mode === "signUp") {
      setConfirmationAttempted(true);
      if (!confirmPassword || password !== confirmPassword) return;
    }

    setSubmitting(true);

    try {
      if (mode === "signIn") {
        await signIn(email, password);
      } else {
        await signUp(displayName, email, password);
      }
      router.replace("/dashboard");
    } catch (err) {
      setError(formatAuthErrorMessage(err, mode));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-dvh bg-white text-[var(--kepler-ink)] lg:grid-cols-2">
      <aside
        aria-label="Kepler construction workspace"
        className="sticky top-0 hidden h-dvh min-w-0 flex-col justify-between overflow-hidden p-10 text-white lg:flex xl:p-14 2xl:p-16"
      >
        <Image
          src="/login/kepler_login.jpg"
          alt="A glass-clad building under construction with tower cranes against the sky"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 0px"
          className="object-cover object-[52%_center]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,14,33,0.4)_0%,rgba(3,14,33,0.04)_38%,rgba(3,14,33,0.78)_100%)]"
        />

        <div className="relative [&_span]:text-white [&_span:first-child]:text-[20px] [&_span:last-child]:text-white/70">
          <KeplerLogo />
        </div>

        <div className="relative max-w-lg pb-2">
          <div aria-hidden="true" className="mb-7 h-px w-10 bg-white/60" />
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/75">
            AI-powered construction management
          </p>
          <h2 className="mt-5 text-[42px] font-medium leading-[1.12] tracking-[-0.045em] xl:text-[52px] 2xl:text-[60px]">
            Build smarter.<br />Manage better.
          </h2>
          <p className="mt-6 max-w-[340px] text-[14px] leading-7 text-white/80">
            From the plans to the field, keep your projects connected.
          </p>
        </div>
      </aside>

      <main className="flex min-h-dvh min-w-0 items-center justify-center px-6 py-10 sm:px-12 sm:py-14 lg:px-10 xl:px-16">
        <div className="w-full max-w-[420px]">
          <div className="mb-12 [&_span:first-child]:text-[20px] sm:mb-14">
            <KeplerLogo />
          </div>

          <header>
            <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.04em] sm:text-[34px]">
              {mode === "signIn" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-3 text-[14px] leading-6 text-[var(--kepler-secondary)]">
              {mode === "signIn"
                ? "Sign in to your Kepler workspace."
                : "Your next project starts with Kepler."}
            </p>
          </header>

          {!configured && (
            <div
              className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] leading-6 text-[var(--kepler-secondary)]"
              role="status"
            >
              Firebase client configuration is missing. Add{" "}
              <span className="font-medium text-[var(--kepler-ink)]">
                NEXT_PUBLIC_FIREBASE_*
              </span>{" "}
              to <span className="font-medium text-[var(--kepler-ink)]">.env.local</span>{" "}
              (same project as Kepler mobile) before signing in.
            </div>
          )}

          <form
            className="mt-9 space-y-6"
            onSubmit={handleSubmit}
            aria-describedby={error ? "auth-error" : undefined}
            aria-busy={submitting}
            noValidate
          >
            {mode === "signUp" && (
              <label className="block text-[13px] font-medium text-[var(--kepler-ink)]">
                Display name
                <input
                  className={inputClass}
                  name="displayName"
                  autoComplete="name"
                  placeholder="Your full name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required={mode === "signUp"}
                  disabled={submitting || !configured}
                />
              </label>
            )}

            <label className="block text-[13px] font-medium text-[var(--kepler-ink)]">
              Email address
              <input
                className={inputClass}
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting || !configured}
              />
            </label>

            <div>
              <label
                htmlFor="kepler-password"
                className="block text-[13px] font-medium text-[var(--kepler-ink)]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="kepler-password"
                  className={`${inputClass} pr-14`}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    mode === "signIn" ? "current-password" : "new-password"
                  }
                  placeholder={mode === "signIn" ? "Enter your password" : "Create a password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  aria-describedby={mode === "signUp" ? "password-hint" : undefined}
                  disabled={submitting || !configured}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  aria-controls="kepler-password"
                  disabled={submitting || !configured}
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-1 top-1/2 mt-1.25 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 outline-none transition-colors hover:text-[var(--kepler-navy)] focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)]/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
              {mode === "signUp" && (
                <p id="password-hint" className="mt-2 text-[12px] leading-5 text-[var(--kepler-muted)]">
                  Use at least 6 characters.
                </p>
              )}
            </div>

            {mode === "signUp" && (
              <div>
                <label
                  htmlFor="kepler-confirm-password"
                  className="block text-[13px] font-medium text-[var(--kepler-ink)]"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="kepler-confirm-password"
                    className={`${inputClass} pr-14`}
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    aria-invalid={Boolean(confirmationError)}
                    aria-describedby={confirmationError ? "confirm-password-error" : undefined}
                    disabled={submitting || !configured}
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
                    aria-pressed={showConfirmPassword}
                    aria-controls="kepler-confirm-password"
                    disabled={submitting || !configured}
                    onClick={() => setShowConfirmPassword((visible) => !visible)}
                    className="absolute right-1 top-1/2 mt-1.25 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 outline-none transition-colors hover:text-[var(--kepler-navy)] focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)]/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {showConfirmPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </div>
                {confirmationError && (
                  <p id="confirm-password-error" className="mt-2 text-[13px] leading-6 text-[var(--kepler-red)]" role="alert">
                    {confirmationError}
                  </p>
                )}
              </div>
            )}

            {error && (
              <p
                id="auth-error"
                className="rounded-lg border border-[var(--kepler-red)]/15 bg-[var(--kepler-red)]/[0.04] px-4 py-3 text-[13px] leading-6 text-[var(--kepler-red)]"
                role="alert"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !configured}
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-lg bg-[var(--kepler-navy)] px-5 text-[14px] font-semibold text-white outline-none transition-colors hover:bg-[#001a4d] focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)] focus-visible:ring-offset-4 disabled:cursor-not-allowed disabled:opacity-55"
            >
              {submitting && <LoaderCircle size={17} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />}
              {submitting
                ? mode === "signIn"
                  ? "Signing in…"
                  : "Creating account…"
                : mode === "signIn"
                  ? "Sign in"
                  : "Create account"}
              {!submitting && <ArrowRight size={17} strokeWidth={1.75} aria-hidden="true" />}
            </button>
          </form>

          <div className="mt-8 text-center text-[13px] leading-6 text-[var(--kepler-secondary)]">
            {mode === "signIn" ? (
              <>
                New to Kepler?{" "}
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center font-semibold text-[var(--kepler-navy)] underline-offset-4 outline-none hover:underline focus-visible:underline"
                  onClick={() => {
                    setMode("signUp");
                    setError(null);
                    setConfirmationAttempted(false);
                    setConfirmPassword("");
                    setShowConfirmPassword(false);
                  }}
                >
                  Create account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center font-semibold text-[var(--kepler-navy)] underline-offset-4 outline-none hover:underline focus-visible:underline"
                  onClick={() => {
                    setMode("signIn");
                    setError(null);
                    setConfirmationAttempted(false);
                    setConfirmPassword("");
                    setShowConfirmPassword(false);
                  }}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
