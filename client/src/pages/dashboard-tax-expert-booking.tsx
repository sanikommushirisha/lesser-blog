import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { CalendarCheck, CheckCircle2, ExternalLink, Loader2, Video, XCircle } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { Reveal } from "@/components/dashboard-motion";
import { ExpertAvatar } from "@/components/tax-expert-avatar";
import { fetchBooking, type ConsultationBooking } from "@/lib/tax-experts";

// Stripe's webhook can land a few seconds after the redirect, and the booking
// only flips to "booked" once the scheduler confirms, so poll until settled.
const POLL_MS = { pending_payment: 3000, paid: 5000 } as const;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl px-6 pb-24 pt-8 md:pt-12">{children}</div>
    </DashboardLayout>
  );
}

function StatusCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <Reveal className="rounded-[2rem] bg-white p-6 text-center shadow-[0_2px_40px_-16px_rgba(0,0,0,0.14)] ring-1 ring-black/[0.05] md:p-10">
      <div className="flex justify-center">{icon}</div>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground" data-testid="text-booking-status">
        {title}
      </h1>
      {children}
    </Reveal>
  );
}

function MeetingDetails({ booking }: { booking: ConsultationBooking }) {
  const meeting = booking.meeting!;
  const start = new Date(meeting.start);
  return (
    <StatusCard
      icon={<CalendarCheck className="h-12 w-12 text-[hsl(var(--success))]" />}
      title="Your consultation is booked"
    >
      <div className="mx-auto mt-6 flex max-w-sm items-center gap-4 rounded-2xl bg-muted p-4 text-left">
        <ExpertAvatar name={booking.expert.name} photoUrl={booking.expert.photoUrl} className="h-12 w-12 shrink-0" />
        <div>
          <p className="font-bold text-foreground">{booking.expert.name}</p>
          <p className="text-sm text-muted-foreground">
            {start.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} at{" "}
            {start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", timeZoneName: "short" })}
          </p>
        </div>
      </div>
      {meeting.meetingUrl ? (
        <>
          <a
            href={meeting.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03] active:scale-[0.98]"
            data-testid="link-meeting"
          >
            <Video className="h-4 w-4" /> Join meeting
          </a>
          <p className="mt-3 break-all text-xs text-muted-foreground">{meeting.meetingUrl}</p>
        </>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">
          The joining details are in your calendar invite.
        </p>
      )}
      <p className="mt-6 text-sm text-muted-foreground">
        A calendar invite was sent to <strong className="text-foreground">{booking.customerEmail}</strong>.
      </p>
    </StatusCard>
  );
}

function Scheduler({ booking }: { booking: ConsultationBooking }) {
  return (
    <>
      <StatusCard
        icon={<CheckCircle2 className="h-12 w-12 text-[hsl(var(--success))]" />}
        title="Payment received. Pick your time"
      >
        <p className="mt-2 text-muted-foreground">
          Choose a slot with {booking.expert.name}. Your meeting link appears here as soon as you book.
        </p>
      </StatusCard>
      {booking.schedulingUrl && (
        <Reveal className="mt-6 overflow-hidden rounded-[2rem] bg-white ring-1 ring-black/[0.05]">
          <iframe
            src={booking.schedulingUrl}
            title={`Schedule with ${booking.expert.name}`}
            className="h-[700px] w-full border-0"
            data-testid="iframe-scheduler"
          />
          <div className="flex items-center justify-between gap-3 border-t border-black/[0.06] px-5 py-3 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Waiting for your booking…
            </span>
            <a
              href={booking.schedulingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
            >
              Open in new tab <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </Reveal>
      )}
    </>
  );
}

export default function DashboardTaxExpertBookingPage() {
  const { id } = useParams<{ id: string }>();
  const sessionId = new URLSearchParams(window.location.search).get("session_id");

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ["tax-expert-booking", sessionId],
    queryFn: () => fetchBooking(sessionId!),
    enabled: !!sessionId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "pending_payment" || status === "paid" ? POLL_MS[status] : false;
    },
    refetchIntervalInBackground: true,
  });

  const backLink = (
    <Link
      href={`/dashboard/tax-experts/${id}`}
      className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
    >
      Back to tax expert
    </Link>
  );

  if (!sessionId || isError) {
    return (
      <Shell>
        <StatusCard icon={<XCircle className="h-12 w-12 text-destructive" />} title="We couldn't find this booking">
          <p className="mt-2 text-muted-foreground">
            If you were charged, email <a href="mailto:use@lesser.tax" className="text-primary">use@lesser.tax</a>{" "}
            and we'll sort it out.
          </p>
          {backLink}
        </StatusCard>
      </Shell>
    );
  }

  if (isLoading || !booking || booking.status === "pending_payment") {
    return (
      <Shell>
        <StatusCard
          icon={<Loader2 className="h-12 w-12 animate-spin text-primary" />}
          title="Confirming your payment…"
        >
          <p className="mt-2 text-muted-foreground">This usually takes a few seconds.</p>
        </StatusCard>
      </Shell>
    );
  }

  if (booking.status === "cancelled") {
    return (
      <Shell>
        <StatusCard icon={<XCircle className="h-12 w-12 text-destructive" />} title="This booking was cancelled">
          {backLink}
        </StatusCard>
      </Shell>
    );
  }

  return <Shell>{booking.meeting ? <MeetingDetails booking={booking} /> : <Scheduler booking={booking} />}</Shell>;
}
