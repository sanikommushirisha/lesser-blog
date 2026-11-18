// Flat multi-colour illustrations for the /tools cards, in the same style and
// palette as the marketplace cards (components/marketplace/service-illustration.tsx).
// The passport card reuses the marketplace passport illustration.

import { ServiceIllustration } from "@/components/marketplace/service-illustration";

const NAVY = "#16305c";
const GOLD = "#d9a828";
const TEAL = "#0f766e";
const GREEN = "#059669";
const GREY = "#cbd5e1";
const PAPER = "#ffffff";

type Props = { className?: string };

function EstimatorIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} role="img" aria-label="Tax estimator">
      <rect x="10" y="6" width="28" height="36" rx="3.5" fill={NAVY} />
      <rect x="14" y="10" width="20" height="9" rx="2" fill="#e6f4f1" />
      <path d="M17 16l3-3.2 2.6 2.2 4.4-4" stroke={GREEN} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="18" cy="25" r="2.2" fill={GOLD} />
      <circle cx="24" cy="25" r="2.2" fill={GREY} />
      <circle cx="30" cy="25" r="2.2" fill={GREY} />
      <circle cx="18" cy="31" r="2.2" fill={GREY} />
      <circle cx="24" cy="31" r="2.2" fill={GREY} />
      <rect x="27.8" y="28.8" width="4.4" height="8.4" rx="2.2" fill={TEAL} />
      <circle cx="18" cy="37" r="2.2" fill={GREY} />
      <circle cx="24" cy="37" r="2.2" fill={GREY} />
    </svg>
  );
}

function RsuIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} role="img" aria-label="RSU calculator">
      <rect x="8" y="9" width="32" height="30" rx="3" fill={PAPER} stroke={TEAL} strokeWidth="1.4" />
      <rect x="13" y="26" width="5" height="9" rx="1" fill={GREY} />
      <rect x="21.5" y="21" width="5" height="14" rx="1" fill={TEAL} />
      <rect x="30" y="15" width="5" height="20" rx="1" fill={GREEN} />
      <path d="M13 22l8-6 6 3 8-8" stroke={NAVY} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="37" cy="9" r="6" fill={GOLD} stroke="#b8860b" strokeWidth="1" />
      <text x="37" y="12.2" fontSize="8.5" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily="system-ui, sans-serif">
        $
      </text>
    </svg>
  );
}

function K401Illustration({ className }: Props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} role="img" aria-label="401(k) calculator">
      <ellipse cx="22" cy="38" rx="14" ry="3.2" fill="#e2eae7" />
      <path d="M8 36V26c0-3 6-5 14-5s14 2 14 5v10c0 2-6 4-14 4S8 38 8 36z" fill={TEAL} />
      <ellipse cx="22" cy="26" rx="14" ry="5" fill={GREEN} />
      <ellipse cx="22" cy="26" rx="9" ry="2.8" fill="#bbe7d6" />
      <path d="M26 17c0-2.6 3-4.2 6-4.2 2.4 0 4.6 1 5.4 2.6" stroke={NAVY} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M34.8 12.6l3 2.7-4 1.2z" fill={NAVY} />
      <circle cx="35" cy="34" r="7" fill={GOLD} stroke="#b8860b" strokeWidth="1" />
      <text x="35" y="36.6" fontSize="6.6" fontWeight="800" fill="#fff" textAnchor="middle" fontFamily="system-ui, sans-serif">
        401k
      </text>
    </svg>
  );
}

export function ToolIllustration({ id, className }: { id: string; className?: string }) {
  switch (id) {
    case "tax-estimator":
      return <EstimatorIllustration className={className} />;
    case "rsu-calculator":
      return <RsuIllustration className={className} />;
    case "401k-calculator":
      return <K401Illustration className={className} />;
    default:
      return <ServiceIllustration id="passport-renewal" className={className} />;
  }
}
