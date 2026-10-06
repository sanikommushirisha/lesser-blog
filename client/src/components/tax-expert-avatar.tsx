import { useState } from "react";
import { initials } from "@/lib/tax-experts";

// CPA photo with an initials fallback for a missing or broken image.
export function ExpertAvatar({
  name,
  photoUrl,
  className = "",
}: {
  name: string;
  photoUrl: string | null;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  if (photoUrl && !broken) {
    return (
      <img
        src={photoUrl}
        alt={name}
        onError={() => setBroken(true)}
        className={`rounded-full object-cover ring-1 ring-black/[0.06] ${className}`}
      />
    );
  }
  return (
    <span
      className={`flex items-center justify-center rounded-full bg-secondary font-extrabold text-primary ${className}`}
      aria-label={name}
    >
      {initials(name)}
    </span>
  );
}
