// The few icons the forms use, inline (the blog has no icon library).

type P = { className?: string };
const svg = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24", "aria-hidden": true };

export const DownloadIcon = ({ className = "h-4 w-4" }: P) => (
  <svg {...svg} className={className}><path d="M12 4v11M7 11l5 5 5-5M5 20h14" /></svg>
);
export const ChevronRightIcon = ({ className = "h-4 w-4" }: P) => (
  <svg {...svg} className={className}><path d="M9 6l6 6-6 6" /></svg>
);
export const ExternalIcon = ({ className = "h-3.5 w-3.5" }: P) => (
  <svg {...svg} className={className}><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" /></svg>
);
export const CheckIcon = ({ className = "h-4 w-4" }: P) => (
  <svg {...svg} className={className}><path d="M5 12l5 5 9-10" /></svg>
);
export const SpinnerIcon = ({ className = "h-4 w-4" }: P) => (
  <svg {...svg} className={`${className} animate-spin`}><path d="M21 12a9 9 0 11-6.2-8.56" /></svg>
);
