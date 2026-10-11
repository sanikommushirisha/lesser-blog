import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { appUrl, googleSignInUrl, login, logout, sendOtp, signup, verifyOtp, fetchPortalUser } from "@/lib/portal";

// Sign in / sign up for the Lesser app without leaving the site. Same fields,
// rules and steps as the app's /auth pages: email + password, Google, and the
// emailed 6-digit code a new account must enter before it can be used. On
// success `onDone` sends the user on to the tool they picked.

type Tab = "login" | "signup";
type Step = "form" | "otp";

const RESEND_COOLDOWN_SECONDS = 45;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-gray-400 focus:border-primary/50 focus:ring-2 focus:ring-primary/10";

const primaryButton =
  "inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-[#023d35] active:scale-[0.99] disabled:opacity-50";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-[18px] w-[18px]" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  autoComplete: string;
}) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={revealed ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder="••••••••••••••••"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} pr-11`}
        />
        <button
          type="button"
          onClick={() => setRevealed((r) => !r)}
          aria-label={revealed ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={revealed}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-primary"
        >
          {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

function OtpStep({ email, onVerified, onSwitchAccount }: { email: string; onVerified: () => void; onSwitchAccount: () => void }) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const send = async () => {
    setSending(true);
    try {
      await sendOtp();
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      const body = (err as { body?: { retryAfter?: number } }).body;
      // A code from a moment ago is still live: resume its cooldown quietly.
      if (typeof body?.retryAfter === "number") setCooldown(body.retryAfter);
      else setMessage({ text: (err as Error).message || "Failed to send the code. Please try again.", error: true });
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    send();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const verify = async (e: FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setMessage(null);
    try {
      await verifyOtp(code);
      onVerified();
    } catch (err) {
      const body = (err as { body?: { error?: string; attemptsRemaining?: number } }).body;
      if (body?.error === "incorrect") {
        setMessage({ text: `That code is incorrect. ${body.attemptsRemaining} attempts remaining.`, error: true });
      } else {
        if (body?.error === "expired" || body?.error === "locked") setCooldown(0);
        setMessage({ text: (err as Error).message, error: true });
      }
      setVerifying(false);
    }
  };

  return (
    <form onSubmit={verify} className="flex flex-col gap-5" data-testid="form-otp">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <p className="mt-3 text-sm text-gray-600">
          We sent a 6-digit code to <strong className="text-foreground">{email}</strong>. Enter it to verify your email.
        </p>
      </div>
      <input
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        autoFocus
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        placeholder="000000"
        aria-label="Verification code"
        className={`${inputClass} text-center text-lg tracking-[0.5em]`}
        data-testid="input-otp"
      />
      {message && <p className={`text-center text-sm ${message.error ? "text-red-500" : "text-gray-600"}`}>{message.text}</p>}
      <button type="submit" disabled={verifying || code.length !== 6} className={primaryButton} data-testid="button-verify-otp">
        {verifying && <Loader2 className="h-4 w-4 animate-spin" />}
        {verifying ? "Verifying…" : "Verify and continue"}
      </button>
      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={send}
          disabled={sending || cooldown > 0}
          className="font-semibold text-primary hover:underline disabled:text-gray-400 disabled:no-underline"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : sending ? "Sending…" : "Resend code"}
        </button>
        <button type="button" onClick={onSwitchAccount} className="text-gray-500 hover:underline">
          Use a different account
        </button>
      </div>
    </form>
  );
}

type FieldErrors = Partial<Record<"email" | "password" | "confirmPassword", string>>;

export default function AuthModal({
  open,
  onOpenChange,
  toolName,
  appPath,
  onDone,
  initialOtpEmail,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Shown in the header so the user knows what they are signing in for. */
  toolName: string;
  /** Where Google sign-in lands, in the app. */
  appPath: string;
  /** Called once the user is signed in and verified. */
  onDone: () => void;
  /** Already signed in but never verified: open straight on the code step. */
  initialOtpEmail?: string | null;
}) {
  const [tab, setTab] = useState<Tab>("signup");
  const [step, setStep] = useState<Step>("form");
  const [otpEmail, setOtpEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Fresh form each time it opens, so one attempt's errors never greet the next.
  useEffect(() => {
    if (!open) return;
    setStep(initialOtpEmail ? "otp" : "form");
    setOtpEmail(initialOtpEmail ?? "");
    setPassword("");
    setConfirmPassword("");
    setErrors({});
    setError(null);
    setLoading(false);
    setGoogleLoading(false);
  }, [open, initialOtpEmail]);

  const switchTab = (next: Tab) => {
    setTab(next);
    setErrors({});
    setError(null);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    const fieldErrors: FieldErrors = {};
    if (!trimmed) fieldErrors.email = "Email is required";
    else if (!EMAIL_RE.test(trimmed)) fieldErrors.email = "Please enter a valid email address";
    if (tab === "signup") {
      if (password.length < 8) fieldErrors.password = "Password must be at least 8 characters";
      if (!confirmPassword) fieldErrors.confirmPassword = "Please confirm your password";
      else if (password !== confirmPassword) fieldErrors.confirmPassword = "Passwords do not match";
    } else if (!password) {
      fieldErrors.password = "Password is required";
    }
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length) return;

    setLoading(true);
    setError(null);
    try {
      if (tab === "signup") {
        await signup(trimmed, password);
        // A new account can't be used until its email is verified.
        setOtpEmail(trimmed);
        setStep("otp");
        setLoading(false);
        return;
      }
      await login(trimmed, password);
      const user = await fetchPortalUser();
      if (user && !user.emailVerified) {
        // An account that never finished its code step goes back into it.
        setOtpEmail(trimmed);
        setStep("otp");
        setLoading(false);
        return;
      }
      onDone();
    } catch (err) {
      const status = (err as { status?: number }).status;
      setError(
        status === 401
          ? "Incorrect email or password. Please try again."
          : status === 502
            ? "We couldn't reach Lesser right now. Please try again in a moment."
            : (err as Error).message,
      );
      setLoading(false);
    }
  };

  const continueWithGoogle = () => {
    setGoogleLoading(true);
    window.location.href = googleSignInUrl(appPath);
  };

  // The unverified account already holds a session, so it is signed out
  // before anyone can sign in as someone else.
  const switchAccount = async () => {
    await logout();
    setStep("form");
    setTab("login");
    setOtpEmail("");
  };

  const heading = step === "otp" ? "Verify your email" : tab === "login" ? "Welcome back" : "Start saving today";
  const subheading =
    step === "otp"
      ? `One last step before ${toolName}`
      : tab === "login"
        ? `Sign in to continue to ${toolName}`
        : `Create your free account to use ${toolName}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[92vh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-3xl border-0 bg-white p-6 sm:rounded-3xl sm:p-8"
        data-testid="modal-portal-auth"
      >
        <div className="flex flex-col items-center text-center">
          <DialogTitle className="font-['EB_Garamond',serif] text-[26px] font-semibold tracking-tight text-[#1a1a1a]">
            {heading}
          </DialogTitle>
          <DialogDescription className="mt-1 text-[13px] text-gray-500">{subheading}</DialogDescription>
        </div>

        {step === "otp" ? (
          <OtpStep email={otpEmail} onVerified={onDone} onSwitchAccount={switchAccount} />
        ) : (
          <div>
            <div className="mb-6 flex items-center gap-1 rounded-full bg-gray-100 p-1" role="tablist">
              {(["login", "signup"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => switchTab(t)}
                  className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-all duration-200 ${
                    tab === t ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                  data-testid={`tab-auth-${t}`}
                >
                  {t === "login" ? "Sign in" : "Sign up"}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={continueWithGoogle}
              disabled={googleLoading || loading}
              className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-white px-6 py-3.5 text-[14px] font-semibold text-[#1a1a1a] shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow-md active:scale-[0.99] disabled:opacity-50"
              data-testid="button-google-auth"
            >
              <GoogleIcon />
              {googleLoading ? "Redirecting…" : "Continue with Google"}
            </button>

            <div className="my-5 flex items-center gap-3 text-xs text-gray-400">
              <span className="h-px flex-1 bg-gray-200" />
              or
              <span className="h-px flex-1 bg-gray-200" />
            </div>

            <form onSubmit={submit} noValidate className="flex flex-col gap-5" data-testid={`form-${tab}`}>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="portal-auth-email" className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="portal-auth-email"
                  type="email"
                  autoComplete="email"
                  placeholder="johndoe@gmail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((er) => ({ ...er, email: undefined }));
                  }}
                  className={inputClass}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
              <PasswordField
                id="portal-auth-password"
                label="Password"
                autoComplete={tab === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(v) => {
                  setPassword(v);
                  setErrors((er) => ({ ...er, password: undefined }));
                }}
                error={errors.password}
              />
              {tab === "login" && (
                <a
                  href={appUrl("/auth/forgot-password")}
                  className="-mt-3 self-end text-sm text-primary hover:underline"
                >
                  Forgot Password?
                </a>
              )}
              {tab === "signup" && (
                <PasswordField
                  id="portal-auth-confirm"
                  label="Confirm Password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(v) => {
                    setConfirmPassword(v);
                    setErrors((er) => ({ ...er, confirmPassword: undefined }));
                  }}
                  error={errors.confirmPassword}
                />
              )}
              {error && <p className="text-sm text-red-500" data-testid="text-auth-error">{error}</p>}
              <button type="submit" disabled={loading || googleLoading} className={primaryButton} data-testid="button-auth-submit">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {tab === "login"
                  ? loading ? "Signing in…" : "Sign in with email"
                  : loading ? "Creating account…" : "Create account"}
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-[11px] leading-relaxed text-gray-400">
          Bank-level encryption · IRS authorized e-filer · Your data is never sold
          <br />
          <a href="/privacy" className="hover:underline">Privacy Policy</a>
          {" · "}
          <a href="/terms" className="hover:underline">Terms of Service</a>
        </p>
      </DialogContent>
    </Dialog>
  );
}
