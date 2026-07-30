import { CheckCircle2, FileText, Headphones, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const coreFeatures = [
  { icon: FileText, label: "Federal & State Filing", id: "federal-state" },
  { icon: Headphones, label: "24/7 Support", id: "support" },
  { icon: UserCheck, label: "Expert CPA Review", id: "cpa-review" },
];

const plans = [
  {
    id: "essential",
    name: "Essential",
    price: 99,
    description: "Professionals & students with standard wage & interest income",
    featured: false,
    includesLabel: "What's included?",
    features: [
      "Tax Savings Plan",
      "Annual CPA Check-in",
      "Multi-state Income",
      "W-2 & Bank Interest",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 399,
    description: "Professionals with stocks, foreign income & complex situations",
    featured: true,
    includesLabel: "Everything in Essential, plus:",
    features: [
      "Tax Savings Plan Implementation",
      "Semi-Annual CPA Check-ins",
      "Stock, Crypto & Capital Gains",
      "Foreign Income & Tax Credits",
    ],
  },
  {
    id: "private-client",
    name: "Private Client",
    price: 999,
    description: "Founders, investors & business owners who need proactive strategy",
    featured: false,
    includesLabel: "Everything in Premium, plus:",
    features: [
      "Quarterly CPA Strategy Sessions",
      "Entity Structure Optimization",
      "Estate & Trust Planning",
      "Dedicated Account Manager",
    ],
  },
];

function FeatureItem({ text, planId, index }: { text: string; planId: string; index: number }) {
  return (
    <div
      className="flex items-center gap-2.5"
      data-testid={`text-feature-${planId}-${index}`}
    >
      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary" />
      <span className="text-sm text-muted-foreground tracking-tight">{text}</span>
    </div>
  );
}

function PricingCard({
  plan,
}: {
  plan: (typeof plans)[0];
}) {
  const { id, name, price, description, featured, includesLabel, features } = plan;

  return (
    <div
      className={`relative flex flex-col p-6 gap-4 bg-white dark:bg-card rounded-3xl border ${
        featured
          ? "border-primary shadow-[6px_6px_4px_rgba(0,0,0,0.12)]"
          : "border-[#D4D4D4] dark:border-border"
      }`}
      data-testid={`card-plan-${id}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3
            className={`font-serif text-2xl sm:text-[32px] font-semibold tracking-tight leading-none ${
              featured ? "text-primary" : "text-foreground"
            }`}
            data-testid={`text-plan-name-${id}`}
          >
            {name}
          </h3>
          <p
            className="text-sm text-muted-foreground max-w-[234px] leading-snug tracking-tight"
            data-testid={`text-plan-description-${id}`}
          >
            {description}
          </p>
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className="text-base text-muted-foreground tracking-tight"
            data-testid={`text-starts-at-${id}`}
          >
            Starts at
          </span>
          <span
            className="font-serif text-[42px] font-semibold tracking-tighter leading-none text-foreground"
            data-testid={`text-price-${id}`}
          >
            ${price}
            <span className="text-xl">/yr</span>
          </span>
        </div>
      </div>

      <div className="w-full border-t border-dashed border-[#D4D4D4] dark:border-border" />

      <div className="flex flex-col gap-4">
        <p
          className="text-sm font-bold uppercase tracking-tight text-foreground"
          data-testid={`text-includes-label-${id}`}
        >
          {includesLabel}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
          {features.map((feature, index) => (
            <FeatureItem key={feature} text={feature} planId={id} index={index} />
          ))}
        </div>
      </div>

      <Button
        className="mt-2 w-full sm:w-auto sm:self-end"
        variant={featured ? "default" : "outline"}
        data-testid={`button-select-${id}`}
      >
        Get Started
      </Button>
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        <div className="text-center space-y-3 mb-8">
          <h1
            className="font-serif text-4xl sm:text-5xl md:text-[56px] font-semibold text-foreground tracking-tighter leading-none"
            data-testid="text-main-heading"
          >
            Flat-Fee Pricing for
            <br />
            Year-Round Strategy
          </h1>
          <p
            className="text-lg sm:text-xl text-muted-foreground tracking-tight"
            data-testid="text-subheading"
          >
            Core Features Included in All Plans
          </p>
        </div>

        <div className="flex justify-center mb-10">
          <div className="inline-flex flex-wrap justify-center items-center gap-6 sm:gap-8 bg-[#FAFAFA] dark:bg-muted/50 rounded-2xl px-6 py-5">
            {coreFeatures.map((feature, index) => (
              <div key={feature.id} className="flex items-center gap-3">
                {index > 0 && (
                  <div className="hidden sm:block w-px h-7 border-l border-dashed border-[#D4D4D4] dark:border-border" />
                )}
                <div
                  className="flex flex-col items-center gap-2"
                  data-testid={`text-core-feature-${feature.id}`}
                >
                  <feature.icon className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground text-center tracking-tight max-w-[80px] leading-tight">
                    {feature.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {plans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <p
            className="text-sm text-muted-foreground tracking-tight"
            data-testid="text-footer-note"
          >
            All plans include federal and state filing, 24/7 support, and expert CPA review.
          </p>
        </div>
      </div>
    </div>
  );
}
