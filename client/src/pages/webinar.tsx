import { useEffect } from "react";
import SharedNavbar from "@/components/shared-navbar";
import css from "./webinar/webinar.css?inline";
import body from "./webinar/body.html?raw";

const PIXEL_ID = "1136015848875611";

/**
 * Landing page for the Nov 15 webinar ("The 15x You Missed"), the destination of
 * the Meta ads. The design is marketing's: its markup and styles live in
 * ./webinar/ and are rendered as-is under the site's shared navbar, so the page
 * is prerendered like every other page. Its motion layer (countdown, reveals,
 * sticky register bar) is /webinar-assets/webinar.js, started after the page mounts.
 *
 * Registration is the Luma form inside the page. Luma is a different site, so
 * this page cannot see a registration: "CompleteRegistration" is sent by Luma's
 * own Meta Pixel setting (pixel above), not by this page.
 */
export default function WebinarPage() {
  useEffect(() => {
    // Meta Pixel for the ads: lesser.tax only, so local runs and previews never count.
    const host = window.location.hostname;
    if (host === "lesser.tax" || host === "www.lesser.tax") {
      type Fbq = ((...a: unknown[]) => void) & { callMethod?: (...a: unknown[]) => void; queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown };
      const w = window as unknown as { fbq?: Fbq; _fbq?: Fbq };
      if (!w.fbq) {
        const fbq: Fbq = function (...a: unknown[]) {
          if (fbq.callMethod) fbq.callMethod(...a);
          else fbq.queue!.push(a);
        };
        w.fbq = fbq;
        w._fbq = fbq;
        fbq.push = fbq;
        fbq.loaded = true;
        fbq.version = "2.0";
        fbq.queue = [];
        const s = document.createElement("script");
        s.async = true;
        s.src = "https://connect.facebook.net/en_US/fbevents.js";
        document.head.appendChild(s);
      }
      w.fbq("init", PIXEL_ID);
      w.fbq("track", "PageView");
    }

    window.scrollTo(0, 0);
    const script = document.createElement("script");
    script.src = "/webinar-assets/webinar.js";
    document.body.appendChild(script);
    return () => script.remove();
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <SharedNavbar variant="individual" sourcePage="/webinar" />
      <div className="wbn" dangerouslySetInnerHTML={{ __html: body }} />
    </>
  );
}
