// Flat multi-colour illustrations for the marketplace cards, keyed by service id.
// Copied from the Lesser app (components/marketplace/ServiceIllustration.tsx) so
// the cards match the portal; keep the two in step.

type Props = { id: string; className?: string };

const NAVY = "#16305c";
const GOLD = "#d9a828";
const GOLD_DK = "#8a6d1a";
const TEAL = "#0f766e";
const GREEN = "#059669";
const GREY = "#cbd5e1";
const PAPER = "#ffffff";

function PassportIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} role="img" aria-label="Passport">
      <rect x="10" y="6" width="28" height="36" rx="3" fill={NAVY} />
      <rect x="10" y="6" width="4.5" height="36" rx="2" fill="#0f2245" />
      <circle cx="25" cy="18" r="6" fill="none" stroke={GOLD} strokeWidth="1.5" />
      <circle cx="25" cy="18" r="2.1" fill={GOLD} />
      <rect x="18" y="28" width="14" height="1.8" rx="0.9" fill={GOLD} />
      <rect x="18" y="32" width="14" height="1.8" rx="0.9" fill={GOLD} />
      <rect x="20" y="36" width="10" height="1.8" rx="0.9" fill="#bf922a" />
    </svg>
  );
}

function IndiaTaxIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} role="img" aria-label="India tax filing">
      <path
        d="M12 7h24v31l-3-2-3 2-3-2-3 2-3-2-3 2-3-2V7z"
        fill={PAPER}
        stroke={TEAL}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M12 7h24v7H12z" fill={TEAL} />
      <text x="24" y="27" fontSize="13" fontWeight="700" fill={GREEN} textAnchor="middle" fontFamily="system-ui, sans-serif">
        ₹
      </text>
      <rect x="17" y="31" width="14" height="1.6" rx="0.8" fill={GREY} />
    </svg>
  );
}

function FormationIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} role="img" aria-label="Company formation certificate">
      <rect x="8" y="10" width="30" height="24" rx="2.5" fill="#fbf8ef" stroke="#cbb98a" strokeWidth="1.4" />
      <rect x="12" y="15" width="14" height="2.2" rx="1.1" fill={NAVY} />
      <rect x="12" y="20" width="19" height="1.5" rx="0.75" fill={GREY} />
      <rect x="12" y="24" width="19" height="1.5" rx="0.75" fill={GREY} />
      <rect x="12" y="28" width="11" height="1.5" rx="0.75" fill={GREY} />
      <path d="M31 34l-2 5 2.7-1.4L34 39l-1-5z" fill="#b8860b" />
      <circle cx="32" cy="31" r="6.2" fill={GOLD} stroke="#b8860b" strokeWidth="1" />
      <path d="M29.4 31l1.7 1.7 3.1-3.3" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RepatriationIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} role="img" aria-label="Fund repatriation">
      <path d="M13 21a10.5 10.5 0 0 1 18-5.5" fill="none" stroke={TEAL} strokeWidth="2.1" strokeLinecap="round" />
      <path d="M31.5 10.5V16h-5.5" fill="none" stroke={TEAL} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M35 27a10.5 10.5 0 0 1-18 5.5" fill="none" stroke={GREEN} strokeWidth="2.1" strokeLinecap="round" />
      <path d="M16.5 37.5V32H22" fill="none" stroke={GREEN} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="24" r="6.2" fill={GOLD} />
      <text x="24" y="27.6" fontSize="9" fontWeight="800" fill={GOLD_DK} textAnchor="middle" fontFamily="system-ui, sans-serif">
        $
      </text>
    </svg>
  );
}

function PropertyTdsIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} role="img" aria-label="Lower TDS on property">
      <path d="M23 9 10 20v15h26V20L23 9z" fill={PAPER} stroke={TEAL} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M23 9 10 20h26L23 9z" fill={TEAL} />
      <rect x="20" y="26" width="6" height="9" fill={TEAL} />
      <circle cx="34" cy="33" r="7" fill={GOLD} />
      <text x="34" y="36.4" fontSize="8.5" fontWeight="800" fill={GOLD_DK} textAnchor="middle" fontFamily="system-ui, sans-serif">
        %
      </text>
    </svg>
  );
}

function GstIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} role="img" aria-label="GST registration">
      <rect x="11" y="8" width="21" height="29" rx="2" fill={PAPER} stroke={TEAL} strokeWidth="1.4" />
      <rect x="15" y="13" width="13" height="2.2" rx="1.1" fill={NAVY} />
      <rect x="15" y="18" width="13" height="1.5" rx="0.75" fill={GREY} />
      <rect x="15" y="22" width="13" height="1.5" rx="0.75" fill={GREY} />
      <rect x="15" y="26" width="8" height="1.5" rx="0.75" fill={GREY} />
      <circle cx="31" cy="31" r="7" fill={GREEN} />
      <path d="M27.8 31l2.2 2.2 4-4.4" stroke="#fff" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ILLUSTRATIONS: Record<string, (p: { className?: string }) => React.ReactElement> = {
  "passport-renewal": PassportIllustration,
  "india-tax-filing": IndiaTaxIllustration,
  "us-business-formation": FormationIllustration,
  "fund-repatriation": RepatriationIllustration,
  "lower-tds-property": PropertyTdsIllustration,
  "gst-registration": GstIllustration,
};

export function ServiceIllustration({ id, className }: Props) {
  const Illustration = ILLUSTRATIONS[id] ?? GstIllustration;
  return <Illustration className={className} />;
}
