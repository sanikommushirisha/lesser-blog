// The three annual plans: the one list behind the homepage cards and /pricing.

export type PlanId = "essential" | "premium" | "private-client";

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  period: string;
  subtitle: string;
  description: string;
  featured: boolean;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: "essential",
    name: "Essential",
    price: 99,
    period: "/yr",
    subtitle: "Ideal for W-2 employees with straightforward tax needs",
    description: "INCLUDES:",
    featured: false,
    features: [
      "Federal & State Filing",
      "W-2 & Bank Interest",
      "Annual CPA Check-in",
      "Basic Deductions Review",
      "Standard Support",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 399,
    period: "/yr",
    subtitle: "Tech professionals with equity compensation & complex income",
    description: "EVERYTHING IN ESSENTIAL, PLUS:",
    featured: true,
    features: [
      "RSU / ISO / NSO Planning",
      "Semi-Annual CPA Check-ins",
      "Foreign Reporting (FBAR / FATCA)",
      "Home Mortgage Optimization",
      "Priority Support",
    ],
  },
  {
    id: "private-client",
    name: "Private Client",
    price: 999,
    period: "/yr",
    subtitle: "Founders, investors & business owners who need proactive strategy",
    description: "EVERYTHING IN PREMIUM, PLUS:",
    featured: false,
    features: [
      "Quarterly CPA Strategy Calls",
      "Business & Rental Income",
      "Trust & Estate Planning",
      "Advanced Tax Strategies",
      "Dedicated Account Manager",
    ],
  },
];

// `plan` is a separate parameter rather than a UTM tag: the app keeps the
// latest UTM tags it sees, so tagging these links would replace the ad or
// channel that brought the visitor (lesser repo, lib/attribution.ts).
export function planSignUpUrl(id: PlanId): string {
  return `https://lesser.tax/app/auth/sign-up?plan=${id}`;
}

export function planCta(plan: Plan): string {
  return `Get ${plan.name} for $${plan.price}${plan.period}`;
}
