"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";

import KeplerAnimatedLogo from "@/components/branding/KeplerAnimatedLogo";
import AuthLoadingScreen from "@/components/kepler/AuthLoadingScreen";
import { useAuth } from "@/lib/kepler/AuthProvider";
import { formatAuthErrorMessage } from "@/lib/kepler/authErrors";

type Mode = "signIn" | "signUp";

const inputClass = `
  mt-2
  h-12
  w-full
  rounded-xl
  border
  border-[#D9E2EA]
  bg-[#F4F6F9]
  px-4
  text-[16px]
  text-[var(--kepler-ink)]
  outline-none
  transition-colors
  shadow-[inset_2px_2px_5px_rgba(13,35,67,0.04),inset_-2px_-2px_5px_rgba(255,255,255,0.9)]
  placeholder:text-[#64748B]
  hover:border-[#b5c3d2]
  focus:border-[var(--kepler-navy)]
  focus:ring-2
  focus:ring-[var(--kepler-navy)]/20
  aria-invalid:border-[var(--kepler-red)]
  aria-invalid:focus:ring-[var(--kepler-red)]/20
  autofill:[-webkit-text-fill-color:#0D2343]
  autofill:caret-[#0D2343]
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

  function selectMode(nextMode: Mode) {
    if (nextMode === mode) return;
    setMode(nextMode);
    setError(null);
    setConfirmationAttempted(false);
    setConfirmPassword("");
    setShowConfirmPassword(false);
  }

  return (
    <div className="grid min-h-dvh bg-[#F4F6F9] text-[var(--kepler-ink)] [--kepler-ink:#0D2343] [--kepler-muted:#64748B] [--kepler-navy:#0D2343] [--kepler-red:#C8102E] [--kepler-secondary:#64748B] lg:grid-cols-[0.95fr_1fr]">
      <aside
        aria-label="Kepler construction workspace"
        className="relative flex min-h-[380px] min-w-0 flex-col justify-between overflow-hidden rounded-b-[32px] p-6 text-white sm:min-h-[400px] sm:p-10 lg:sticky lg:top-0 lg:h-dvh lg:rounded-l-none lg:rounded-r-[40px] xl:p-14 2xl:p-16"
      >
        <Image
          src="/login/kepler_login.jpg"
          alt="A glass-clad building under construction with tower cranes against the sky"
          fill
          priority
          sizes="(min-width: 1024px) 49vw, 100vw"
          className="object-cover object-[52%_center]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,35,67,0.5)_0%,rgba(13,35,67,0.16)_35%,rgba(13,35,67,0.94)_100%)]"
        />

        <div className="relative w-[180px] max-w-full">
          <KeplerAnimatedLogo
            width={180}
            height={74}
            wordmarkColor="#FFFFFF"
            taglineColor="#FFFFFF"
            autoPlay
            showTagline
          />
        </div>

        <div className="relative max-w-lg pb-2">
          <div aria-hidden="true" className="mb-5 h-0.5 w-10 bg-[var(--kepler-red)]" />
          <p className="max-w-[300px] text-[10px] font-medium uppercase leading-5 tracking-[0.18em] text-white/85 sm:max-w-none sm:text-[11px]">
            AI-powered construction management
          </p>
          <h2 className="mt-3 text-[30px] font-semibold leading-[1.12] tracking-[-0.045em] sm:text-[38px] lg:mt-5 lg:text-[42px] xl:text-[52px] 2xl:text-[60px]">
            <span className="block">Build smarter.</span>
            <span className="relative isolate mt-3 inline-block px-2 py-1 sm:px-3">
              <span aria-hidden="true" className="absolute inset-0 -z-10 -skew-x-6 bg-[var(--kepler-red)]" />
              Manage better.
            </span>
          </h2>
          <p className="mt-4 max-w-[350px] text-[13px] leading-6 text-white/85 lg:mt-6 lg:text-[14px] lg:leading-7">
            Plan, collaborate, and deliver construction projects with the power of AI.
          </p>
        </div>
      </aside>

      <main className="relative isolate flex min-w-0 items-center justify-center px-4 py-7 sm:px-8 sm:py-10 lg:min-h-dvh lg:px-7 lg:py-6 xl:px-12">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-28 -top-48 h-[650px] w-40 -rotate-45 border-x border-[#D9E2EA]/35 bg-white/35" />
          <div className="absolute -bottom-48 -left-40 h-[600px] w-32 -rotate-45 border-x border-[#D9E2EA]/30 bg-white/30" />
        </div>
        <div className="w-full max-w-[480px] rounded-[30px] border border-[#D9E2EA]/80 bg-white p-6 shadow-[12px_16px_44px_-16px_rgba(13,35,67,0.16),-12px_-12px_36px_rgba(255,255,255,0.9),0_2px_6px_rgba(13,35,67,0.03)] sm:p-8 lg:p-7 xl:p-8 2xl:p-10">
          <div
            role="tablist"
            aria-label="Kepler account access"
            className="mb-5 grid grid-cols-2 gap-1 rounded-full border border-[#D9E2EA]/60 bg-[#F4F6F9] p-1.5 shadow-[inset_2px_2px_4px_rgba(13,35,67,0.04)]"
          >
            {(["signUp", "signIn"] as const).map((tabMode) => (
              <button
                key={tabMode}
                id={`auth-tab-${tabMode}`}
                type="button"
                role="tab"
                aria-selected={mode === tabMode}
                aria-controls="auth-panel"
                tabIndex={mode === tabMode ? 0 : -1}
                disabled={submitting}
                onClick={() => selectMode(tabMode)}
                onKeyDown={(event) => {
                  let nextMode: Mode;
                  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                    nextMode = tabMode === "signIn" ? "signUp" : "signIn";
                  } else if (event.key === "Home") {
                    nextMode = "signUp";
                  } else if (event.key === "End") {
                    nextMode = "signIn";
                  } else {
                    return;
                  }
                  event.preventDefault();
                  selectMode(nextMode);
                  document.getElementById(`auth-tab-${nextMode}`)?.focus();
                }}
                className={`relative flex min-h-11 items-center justify-center rounded-full px-4 text-[14px] font-semibold outline-none transition-[color,background-color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55 motion-reduce:transition-none ${
                  mode === tabMode
                    ? "bg-[var(--kepler-navy)] text-white shadow-[0_3px_8px_rgba(13,35,67,0.18)]"
                    : "text-[var(--kepler-secondary)] hover:bg-white/70 hover:text-[var(--kepler-navy)]"
                }`}
              >
                {tabMode === "signUp" ? "Register" : "Sign in"}
                <span aria-hidden="true" className={`absolute bottom-1 left-1/2 h-0.5 w-7 -translate-x-1/2 rounded-full bg-[var(--kepler-red)] transition-opacity duration-200 motion-reduce:transition-none ${mode === tabMode ? "opacity-100" : "opacity-0"}`} />
              </button>
            ))}
          </div>

          <div id="auth-panel" role="tabpanel" aria-labelledby={`auth-tab-${mode}`}>
            <header>
              <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.04em] sm:text-[28px]">
                {mode === "signIn" ? "Welcome back to Kepler" : "Create your account"}
              </h1>
              <p className="mt-2 text-[13px] leading-6 text-[var(--kepler-secondary)]">
                {mode === "signIn"
                  ? "Sign in to your construction workspace."
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
              className="mt-5 space-y-4"
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
                    className="absolute right-1 top-1/2 mt-1 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 outline-none transition-colors hover:text-[var(--kepler-navy)] focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)]/30 disabled:cursor-not-allowed disabled:opacity-50"
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
                      className="absolute right-1 top-1/2 mt-1 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 outline-none transition-colors hover:text-[var(--kepler-navy)] focus-visible:ring-2 focus-visible:ring-[var(--kepler-navy)]/30 disabled:cursor-not-allowed disabled:opacity-50"
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
                className="group relative isolate inline-flex min-h-12 w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-[var(--kepler-navy)] px-5 text-[14px] font-semibold text-white shadow-[0_5px_12px_rgba(13,35,67,0.2),inset_0_1px_0_rgba(255,255,255,0.12)] outline-none transition-[transform,box-shadow] duration-200 before:absolute before:inset-y-0 before:left-0 before:-z-10 before:w-1 before:bg-[var(--kepler-red)] before:opacity-0 before:transition-opacity hover:shadow-[0_7px_18px_rgba(13,35,67,0.24)] hover:before:opacity-100 focus-visible:ring-2 focus-visible:ring-[var(--kepler-red)]/70 focus-visible:ring-offset-4 focus-visible:before:opacity-100 enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 motion-reduce:transform-none motion-reduce:transition-none motion-reduce:before:transition-none"
              >
                {submitting && <LoaderCircle size={17} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />}
                {submitting
                  ? mode === "signIn"
                    ? "Signing in…"
                    : "Creating account…"
                  : mode === "signIn"
                    ? "Sign in"
                    : "Create account"}
                {!submitting && <ArrowRight size={17} strokeWidth={1.75} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none" />}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
