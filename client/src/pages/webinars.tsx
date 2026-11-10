import { useEffect, useState } from "react";
import SharedNavbar from "@/components/shared-navbar";
import { WEBINARS, type WebinarEntry } from "@shared/webinars";

// Same card as the blog's post list (blog/src/components/PostCard.tsx): rounded image with a
// label chip (top right here, so it never covers the headline in the event image), a small date line, a bold two-line title and a person row.
function initials(name: string) {
  return name.split(/\s+/).map((w) => w.charAt(0)).slice(0, 2).join("");
}

function WebinarCard({ w, label }: { w: WebinarEntry; label: "Upcoming" | "Past" }) {
  return (
    <li className="group">
      <a
        href={w.href}
        {...(w.external ? { target: "_blank", rel: "noopener" } : {})}
        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        data-testid={`card-webinar-${w.slug}`}
      >
        <div className="relative overflow-hidden rounded-2xl">
          <img
            src={w.image}
            alt={w.title}
            width={600}
            height={400}
            loading="lazy"
            className="aspect-[3/2] w-full object-cover object-top transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
          <span className="absolute right-3 top-3 rounded-full bg-background px-3.5 py-1.5 text-sm font-medium text-foreground shadow-sm">
            {label}
          </span>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          <time dateTime={w.startsAt}>{w.whenLabel}</time>
          {" • "}
          Live on Zoom
        </p>
        <h3 className="mt-1.5 line-clamp-2 text-xl font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
          {w.title}
        </h3>
        <div className="mt-3 flex items-center gap-2.5">
          <span className="flex">
            {w.speakers.map((s, i) => (
              <span
                key={s}
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-secondary text-xs font-medium text-primary ${i ? "-ml-2" : ""}`}
                aria-hidden="true"
              >
                {initials(s)}
              </span>
            ))}
          </span>
          <span className="text-sm font-medium text-foreground">{w.speakers.join(" and ")}</span>
        </div>
      </a>
    </li>
  );
}

export default function WebinarsPage() {
  // Rendered from the build-time order; after mount, a webinar that has ended moves to "Past".
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    window.scrollTo(0, 0);
    setNow(Date.now());
  }, []);
  const ended = (w: WebinarEntry) => now !== null && now >= Date.parse(w.endsAt);
  const upcoming = WEBINARS.filter((w) => w.status === "upcoming" && !ended(w)).sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  const past = WEBINARS.filter((w) => !upcoming.includes(w)).sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt));

  return (
    <>
      <SharedNavbar variant="individual" sourcePage="/webinars" />
      <main className="mx-auto w-full max-w-7xl px-6 pt-28 pb-20">
        <header>
          <h1 className="text-4xl font-bold text-foreground">Webinars</h1>
          <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
            Live sessions with Lesser Tax and expert guests on tax, retirement, estate planning and investing for immigrants.
          </p>
        </header>

        <section className="mt-12" aria-labelledby="upcoming-h">
          <div className="flex items-center gap-5">
            <h2 id="upcoming-h" className="text-2xl font-bold text-foreground">Upcoming</h2>
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
          </div>
          {upcoming.length ? (
            <ul className="mt-6 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((w) => <WebinarCard key={w.slug} w={w} label="Upcoming" />)}
            </ul>
          ) : (
            <p className="mt-6 text-muted-foreground">No webinars are scheduled right now. Check back soon.</p>
          )}
        </section>

        <section className="mt-20" aria-labelledby="past-h">
          <div className="flex items-center gap-5">
            <h2 id="past-h" className="text-2xl font-bold text-foreground">Past webinars</h2>
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
          </div>
          {past.length ? (
            <ul className="mt-6 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((w) => <WebinarCard key={w.slug} w={w} label="Past" />)}
            </ul>
          ) : (
            <p className="mt-6 text-muted-foreground">Past webinars will appear here.</p>
          )}
        </section>
      </main>
    </>
  );
}
