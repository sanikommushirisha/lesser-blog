// A small responsive SVG line chart for the 401(k) calculator: projected balance
// and the money put in, by age. Plain SVG so it renders in the prerendered HTML
// and on phones without a chart library.

import type { YearPoint } from "@shared/tools/retirement";
import { usd } from "@shared/tools/federal";

const W = 640;
const H = 280;
const PAD = { l: 64, r: 16, t: 16, b: 32 };

function niceMax(v: number) {
  if (v <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * exp >= v) return m * exp;
  return 10 * exp;
}

const short = (n: number) => (n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M` : n >= 1_000 ? `$${Math.round(n / 1_000)}K` : `$${n}`);

export default function GrowthChart({ points, summary }: { points: YearPoint[]; summary: string }) {
  if (points.length < 2) return null;
  const maxV = niceMax(Math.max(...points.map((p) => p.balance)));
  const x0 = points[0].age;
  const x1 = points[points.length - 1].age;
  const sx = (age: number) => PAD.l + ((age - x0) / Math.max(1, x1 - x0)) * (W - PAD.l - PAD.r);
  const sy = (v: number) => PAD.t + (1 - v / maxV) * (H - PAD.t - PAD.b);
  const line = (key: "balance" | "contributed") => points.map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.age).toFixed(1)},${sy(p[key]).toFixed(1)}`).join(" ");
  const area = `${line("balance")} L${sx(x1).toFixed(1)},${sy(0)} L${sx(x0).toFixed(1)},${sy(0)} Z`;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * maxV);
  const span = x1 - x0;
  const step = span <= 12 ? 2 : span <= 30 ? 5 : 10;
  const xTicks: number[] = [];
  for (let a = Math.ceil(x0 / step) * step; a <= x1; a += step) xTicks.push(a);
  if (!xTicks.includes(x0)) xTicks.unshift(x0);
  if (!xTicks.includes(x1) && x1 - xTicks[xTicks.length - 1] > step / 2) xTicks.push(x1);

  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={summary} data-testid="growth-chart">
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={sy(v)} y2={sy(v)} stroke="#e0e8e5" strokeWidth="1" />
            <text x={PAD.l - 8} y={sy(v) + 4} textAnchor="end" fontSize="11" fill="#5b6b66">{short(v)}</text>
          </g>
        ))}
        {xTicks.map((a) => (
          <text key={a} x={sx(a)} y={H - 10} textAnchor="middle" fontSize="11" fill="#5b6b66">{a}</text>
        ))}
        <path d={area} fill="#034f46" opacity="0.1" />
        <path d={line("contributed")} fill="none" stroke="#8aa39c" strokeWidth="2" strokeDasharray="5 4" />
        <path d={line("balance")} fill="none" stroke="#034f46" strokeWidth="3" strokeLinejoin="round" />
        <circle cx={sx(x1)} cy={sy(points[points.length - 1].balance)} r="4.5" fill="#034f46" />
      </svg>
      <figcaption className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><span className="inline-block h-0.5 w-5 bg-primary" aria-hidden="true" /> Projected balance: {usd(points[points.length - 1].balance)} at {x1}</span>
        <span className="inline-flex items-center gap-1.5"><span className="inline-block h-0.5 w-5 border-t-2 border-dashed border-[#8aa39c]" aria-hidden="true" /> Money you and your employer put in</span>
      </figcaption>
    </figure>
  );
}
