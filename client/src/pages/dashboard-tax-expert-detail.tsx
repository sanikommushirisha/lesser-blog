import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import {
  AlertCircle,
  Building2,
  CalendarDays,
  ChevronRight,
  Clock,
  GraduationCap,
  Loader2,
  LogIn,
  MapPin,
  Monitor,
  UserPlus,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { Reveal } from "@/components/dashboard-motion";
import { ExpertAvatar } from "@/components/tax-expert-avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ApiError,
  authUrl,
  fetchAvailability,
  fetchTaxExpert,
  flagFor,
  formatPrice,
  isValidPhone,
  startCheckout,
  type AvailabilitySlot,
  type TaxExpertDetail,
} from "@/lib/tax-experts";

// Slot chips shown per day before collapsing into "+N more".
const SLOTS_PER_DAY = 8;

// Set on the return trip from app sign-in / sign-up, so checkout resumes as that user.
const RESUME_PARAM = "resume";

/* ------------------------------------------------------------------ */
/* Profile                                                             */
/* ------------------------------------------------------------------ */

function Fact({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <li className="flex items-center gap-3 text-sm text-foreground/85">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span>{children}</span>
    </li>
  );
}

function ProfileCard({ expert }: { expert: TaxExpertDetail }) {
  const education = [expert.qualification, expert.university].filter(Boolean).join(", ");
  return (
    <Reveal className="rounded-[2rem] bg-white p-6 shadow-[0_2px_40px_-16px_rgba(0,0,0,0.14)] ring-1 ring-black/[0.05] md:p-8">
      <div className="flex flex-col-reverse gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-foreground" data-testid="text-expert-name">
            {expert.name}
          </h1>
          {expert.jurisdictions.length > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              Services for{" "}
              {expert.jurisdictions.map((j) => (
                <span key={j} title={j} className="ml-0.5">
                  {flagFor(j)}
                </span>
              ))}
            </p>
          )}
          <ul className="mt-5 space-y-3">
            {expert.firmName && (
              <Fact icon={Building2}>
                Partner at <strong className="font-semibold text-foreground">{expert.firmName}</strong>
              </Fact>
            )}
            {education && <Fact icon={GraduationCap}>{education}</Fact>}
            {expert.yearsOfExperience != null && (
              <Fact icon={Clock}>Experience of {expert.yearsOfExperience} years</Fact>
            )}
            {expert.location && <Fact icon={MapPin}>Lives in {expert.location}</Fact>}
          </ul>
        </div>
        <ExpertAvatar
          name={expert.name}
          photoUrl={expert.photoUrl}
          className="h-28 w-28 shrink-0 text-3xl sm:h-36 sm:w-36"
        />
      </div>
      {expert.bio && (
        <p className="mt-6 border-t border-black/[0.06] pt-6 leading-relaxed text-muted-foreground">{expert.bio}</p>
      )}
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* Consultation + availability                                         */
/* ------------------------------------------------------------------ */

function ConsultationCard({ expert, onBook }: { expert: TaxExpertDetail; onBook: () => void }) {
  const original = expert.originalPriceCents;
  const discount =
    original && original > expert.priceCents ? Math.round((1 - expert.priceCents / original) * 100) : 0;

  return (
    <Reveal className="relative overflow-hidden rounded-3xl bg-white p-5 ring-1 ring-black/[0.07]">
      {discount > 0 && (
        <span className="absolute right-0 top-0 rounded-bl-2xl bg-[hsl(var(--success))]/15 px-3 py-1.5 text-xs font-bold text-[hsl(var(--success))]">
          {discount}% off
        </span>
      )}
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
          <Monitor className="h-5 w-5 text-foreground/70" />
        </span>
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          {expert.durationMinutes}min Consultation
        </h2>
      </div>
      {expert.services.length > 0 && (
        <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          {expert.services.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      )}
      <button
        onClick={onBook}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
        data-testid="button-book-consultation"
      >
        Book at
        {discount > 0 && <span className="font-normal line-through opacity-70">{formatPrice(original!)}</span>}
        <span className="text-base font-extrabold">{formatPrice(expert.priceCents)}</span>
      </button>
    </Reveal>
  );
}

const dayKey = (iso: string) => new Date(iso).toDateString();

function AvailabilityCard({ expertId }: { expertId: string }) {
  const { data: slots, isLoading, isError } = useQuery({
    queryKey: ["tax-expert-availability", expertId],
    queryFn: () => fetchAvailability(expertId),
  });

  // Next five days that have openings, in the visitor's own timezone.
  const days = useMemo(() => {
    const byDay = new Map<string, AvailabilitySlot[]>();
    for (const slot of slots ?? []) {
      const key = dayKey(slot.start);
      byDay.set(key, [...(byDay.get(key) ?? []), slot]);
    }
    return Array.from(byDay.values()).slice(0, 5);
  }, [slots]);

  return (
    <Reveal className="rounded-3xl bg-white p-5 ring-1 ring-black/[0.07]">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
          <CalendarDays className="h-5 w-5 text-foreground/70" />
        </span>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">Availability</h2>
          <p className="text-xs text-muted-foreground">You'll pick your exact time right after payment.</p>
        </div>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
          </div>
        ) : isError || days.length === 0 ? (
          <p className="text-sm text-muted-foreground" data-testid="text-no-availability">
            {isError ? "Couldn't load availability right now." : "No open slots in the coming days."}
          </p>
        ) : (
          <div className="space-y-4">
            {days.map((daySlots) => (
              <div key={daySlots[0].start}>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {new Date(daySlots[0].start).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {daySlots.slice(0, SLOTS_PER_DAY).map((slot) => (
                    <span
                      key={slot.start}
                      className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary"
                    >
                      {new Date(slot.start).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                    </span>
                  ))}
                  {daySlots.length > SLOTS_PER_DAY && (
                    <span className="rounded-full px-2 py-1 text-xs font-medium text-muted-foreground">
                      +{daySlots.length - SLOTS_PER_DAY} more
                    </span>
                  )}
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              Times in {Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, " ")}
            </p>
          </div>
        )}
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* Form fields with inline validation                                  */
/* ------------------------------------------------------------------ */

type FieldErrors = Partial<Record<"name" | "email" | "phone", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_HINT = "Enter a valid phone number, including the country code if outside the US.";

function phoneError(phone: string): string | undefined {
  if (!phone.trim()) return "Please enter your phone number.";
  if (!isValidPhone(phone)) return PHONE_HINT;
  return undefined;
}

function validateGuest(v: { name: string; email: string; phone: string }): FieldErrors {
  const errors: FieldErrors = {};
  if (!v.name.trim()) errors.name = "Please enter your full name.";
  if (!v.email.trim()) errors.email = "Please enter your email address.";
  else if (!EMAIL_RE.test(v.email.trim())) errors.email = "Enter a valid email address, like name@example.com.";
  const phone = phoneError(v.phone);
  if (phone) errors.phone = phone;
  return errors;
}

/** Label + input + red message under it; the input turns red while invalid. */
function Field({
  id,
  label,
  error,
  ...input
}: {
  id: string;
  label: string;
  error?: string;
} & React.ComponentProps<typeof Input>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className={error ? "text-destructive" : undefined}>
        {label}
      </Label>
      <Input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={error ? "border-destructive focus-visible:ring-destructive/40" : undefined}
        {...input}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="flex items-center gap-1.5 text-sm font-medium text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/** Error from the server (payment couldn't start, rate limit, ...). */
function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm font-medium text-destructive"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Checkout dialog: guest, log in, or sign up                          */
/* ------------------------------------------------------------------ */

function CheckoutDialog({
  expert,
  open,
  onOpenChange,
}: {
  expert: TaxExpertDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);

  const returnPath = `/dashboard/tax-experts/${expert.id}?${RESUME_PARAM}=1`;

  // Editing a field clears its message; the rest stay until they're fixed.
  const edit = (field: keyof FieldErrors, set: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    set(e.target.value);
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setError(null);
  };

  const payAsGuest = async (e: FormEvent) => {
    e.preventDefault();
    const errors = validateGuest({ name, email, phone });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      // Put the cursor on the first field that needs fixing.
      const first = (["name", "email", "phone"] as const).find((f) => errors[f]);
      document.getElementById(`guest-${first}`)?.focus();
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const url = await startCheckout(expert.id, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Couldn't start payment. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>Book with {expert.name}</DialogTitle>
          <DialogDescription>
            {expert.durationMinutes}min consultation · {formatPrice(expert.priceCents)}. After payment you'll
            choose a time and get your meeting link.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={payAsGuest} noValidate className="space-y-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <UserRound className="h-4 w-4" /> Continue as guest
          </p>
          <Field
            id="guest-name"
            label="Full name"
            autoComplete="name"
            value={name}
            onChange={edit("name", setName)}
            error={fieldErrors.name}
            data-testid="input-guest-name"
          />
          <Field
            id="guest-email"
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={edit("email", setEmail)}
            error={fieldErrors.email}
            data-testid="input-guest-email"
          />
          <Field
            id="guest-phone"
            label="Phone"
            type="tel"
            autoComplete="tel"
            placeholder="+1 415 555 0100"
            value={phone}
            onChange={edit("phone", setPhone)}
            error={fieldErrors.phone}
            data-testid="input-guest-phone"
          />
          <FormError message={error} />
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            data-testid="button-pay-guest"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Pay {formatPrice(expert.priceCents)}
          </button>
        </form>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-black/[0.08]" /> or <span className="h-px flex-1 bg-black/[0.08]" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <a
            href={authUrl("login", returnPath)}
            className="flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold text-primary ring-1 ring-primary/30 hover:bg-secondary"
            data-testid="link-checkout-login"
          >
            <LogIn className="h-4 w-4" /> Log in
          </a>
          <a
            href={authUrl("sign-up", returnPath)}
            className="flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold text-primary ring-1 ring-primary/30 hover:bg-secondary"
            data-testid="link-checkout-signup"
          >
            <UserPlus className="h-4 w-4" /> Sign up
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** A signed-in client with no phone on file gives one before paying. */
function PhoneDialog({
  expert,
  open,
  onOpenChange,
}: {
  expert: TaxExpertDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const invalid = phoneError(phone);
    setFieldError(invalid);
    if (invalid) {
      document.getElementById("user-phone")?.focus();
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      window.location.href = await startCheckout(expert.id, undefined, phone.trim());
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Couldn't start payment. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>Add your phone number</DialogTitle>
          <DialogDescription>
            {expert.name} may call or text you about your consultation. We'll save it to your Lesser
            account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="space-y-3">
          <Field
            id="user-phone"
            label="Phone"
            type="tel"
            autoFocus
            autoComplete="tel"
            placeholder="+1 415 555 0100"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setFieldError(undefined);
              setError(null);
            }}
            error={fieldError}
            data-testid="input-user-phone"
          />
          <FormError message={error} />
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            data-testid="button-pay-user"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Continue to payment
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function DashboardTaxExpertDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [resuming, setResuming] = useState(
    () => new URLSearchParams(window.location.search).get(RESUME_PARAM) === "1",
  );

  const { data: expert, isLoading, error } = useQuery({
    queryKey: ["tax-expert", id],
    queryFn: () => fetchTaxExpert(id),
  });

  // Back from app sign-in / sign-up: go straight to payment as that user. No
  // phone on file: ask for it first. No session after all (401): fall back to
  // the checkout dialog.
  useEffect(() => {
    if (!resuming || !expert) return;
    window.history.replaceState(null, "", window.location.pathname);
    startCheckout(expert.id)
      .then((url) => {
        window.location.href = url;
      })
      .catch((err) => {
        setResuming(false);
        if (err instanceof ApiError && err.code === "phone_required") {
          setPhoneOpen(true);
          return;
        }
        if (!(err instanceof ApiError && err.status === 401)) console.error(err);
        setCheckoutOpen(true);
      });
  }, [resuming, expert]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl px-6 pb-24 pt-8 md:pt-12">
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/dashboard/tax-experts" className="hover:text-foreground">
            Tax Experts
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-foreground">{expert?.name ?? "View Details"}</span>
        </nav>

        {isLoading ? (
          <Skeleton className="h-72 rounded-[2rem]" />
        ) : !expert ? (
          <div className="rounded-[2rem] bg-white px-6 py-16 text-center ring-1 ring-black/[0.05]">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              {error instanceof ApiError && error.status === 404
                ? "This tax expert isn't available"
                : "Couldn't load this tax expert"}
            </h1>
            <Link
              href="/dashboard/tax-experts"
              className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              See all tax experts
            </Link>
          </div>
        ) : (
          <>
            <ProfileCard expert={expert} />
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <ConsultationCard expert={expert} onBook={() => setCheckoutOpen(true)} />
              <AvailabilityCard expertId={expert.id} />
            </div>
            <CheckoutDialog expert={expert} open={checkoutOpen} onOpenChange={setCheckoutOpen} />
            <PhoneDialog expert={expert} open={phoneOpen} onOpenChange={setPhoneOpen} />
            {resuming && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Taking you to payment…
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
