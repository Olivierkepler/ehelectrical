"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import KeplerLogo from "@/components/kepler/KeplerLogo";
import AuthLoadingScreen from "@/components/kepler/AuthLoadingScreen";
import { useAuth } from "@/lib/kepler/AuthProvider";
import { formatAuthErrorMessage } from "@/lib/kepler/authErrors";

type Mode = "signIn" | "signUp";

const inputClass = `
  mt-2
  min-h-11
  w-full
  rounded-[6px]
  border
  border-[var(--kepler-border)]
  bg-[var(--kepler-surface)]
  px-3.5
  text-[14px]
  text-[var(--kepler-ink)]
  outline-none
  transition-colors
  placeholder:text-[var(--kepler-muted)]
  focus:border-[var(--kepler-navy)]/40
  focus:ring-2
  focus:ring-[var(--kepler-navy)]/15
`;

export default function LoginPage() {
  const { user, loading, configured, signIn, signUp } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("signIn");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="min-h-dvh bg-[var(--kepler-background)] text-[var(--kepler-ink)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col lg:flex-row">
        {/* Brand panel — desktop */}
        <aside
          className="
            hidden
            flex-col
            justify-between
            border-r
            border-[var(--kepler-border)]
            bg-[var(--kepler-surface)]
            px-10
            py-12
            lg:flex
            lg:w-[42%]
          "
        >
          <KeplerLogo />
          <div>
            <h1 className="max-w-sm text-[28px] font-semibold tracking-[-0.03em] text-[var(--kepler-ink)]">
              Operate projects with clarity.
            </h1>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-[var(--kepler-secondary)]">
              Sign in to your Kepler workspace. Field evidence, plan baselines,
              and project coordination stay connected to the same account you
              use on mobile.
            </p>
          </div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--kepler-muted)]">
            Build smarter
          </p>
        </aside>

        {/* Form panel */}
        <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[400px]">
            <div className="mb-8 lg:hidden">
              <KeplerLogo />
            </div>

            <h2 className="text-[22px] font-semibold tracking-[-0.025em]">
              {mode === "signIn" ? "Sign in" : "Create account"}
            </h2>
            <p className="mt-1.5 text-[14px] text-[var(--kepler-secondary)]">
              {mode === "signIn"
                ? "Use your Kepler email and password."
                : "Create an email and password for Kepler."}
            </p>

            {!configured && (
              <div
                className="
                  mt-6
                  rounded-[6px]
                  border
                  border-[var(--kepler-border)]
                  bg-[var(--kepler-surface)]
                  px-4
                  py-3
                  text-[13px]
                  text-[var(--kepler-secondary)]
                "
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

            <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
              {mode === "signUp" && (
                <label className="block text-[12px] font-medium text-[var(--kepler-secondary)]">
                  Display name
                  <input
                    className={inputClass}
                    name="displayName"
                    autoComplete="name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required={mode === "signUp"}
                    disabled={submitting || !configured}
                  />
                </label>
              )}

              <label className="block text-[12px] font-medium text-[var(--kepler-secondary)]">
                Email
                <input
                  className={inputClass}
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={submitting || !configured}
                />
              </label>

              <label className="block text-[12px] font-medium text-[var(--kepler-secondary)]">
                Password
                <input
                  className={inputClass}
                  name="password"
                  type="password"
                  autoComplete={
                    mode === "signIn" ? "current-password" : "new-password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={submitting || !configured}
                />
              </label>

              {error && (
                <p
                  className="text-[13px] text-[var(--kepler-red)]"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || !configured}
                className="
                  mt-2
                  inline-flex
                  min-h-11
                  w-full
                  items-center
                  justify-center
                  rounded-[6px]
                  bg-[var(--kepler-navy)]
                  px-4
                  text-[13px]
                  font-semibold
                  tracking-[0.02em]
                  text-white
                  outline-none
                  transition-opacity
                  focus-visible:ring-2
                  focus-visible:ring-[var(--kepler-navy)]/30
                  disabled:cursor-not-allowed
                  disabled:opacity-55
                "
              >
                {submitting
                  ? mode === "signIn"
                    ? "Signing in…"
                    : "Creating account…"
                  : mode === "signIn"
                    ? "Sign in"
                    : "Create account"}
              </button>
            </form>

            <div className="mt-6 text-center text-[13px] text-[var(--kepler-secondary)]">
              {mode === "signIn" ? (
                <>
                  Need an account?{" "}
                  <button
                    type="button"
                    className="
                      font-semibold
                      text-[var(--kepler-navy)]
                      outline-none
                      focus-visible:underline
                    "
                    onClick={() => {
                      setMode("signUp");
                      setError(null);
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
                    className="
                      font-semibold
                      text-[var(--kepler-navy)]
                      outline-none
                      focus-visible:underline
                    "
                    onClick={() => {
                      setMode("signIn");
                      setError(null);
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
    </div>
  );
}
