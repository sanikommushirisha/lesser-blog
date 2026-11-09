import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FREE_SIGN_UP_URL, PLANS, planCta, planSignUpUrl } from "@/lib/plans";

// The three plan cards, used on the homepage and on /pricing. The homepage
// passes isVisible for its scroll-in animation; /pricing keeps the default so
// the cards are visible without JavaScript.
export default function PlanCards({ isVisible = true }: { isVisible?: boolean }) {
  return (
    <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
      {PLANS.map((plan, index) => {
        const baseDelay = 200 + index * 150;
        return (
          <div
            key={plan.id}
            className={`group relative bg-white dark:bg-card rounded-2xl overflow-hidden flex flex-col transition-all duration-700 ease-out ${
              plan.featured
                ? 'border-2 border-primary shadow-[0_8px_32px_-4px_rgba(3,79,70,0.15)] md:-translate-y-4 hover:shadow-[0_16px_48px_-8px_rgba(3,79,70,0.22)] hover:-translate-y-5'
                : 'border border-gray-200 dark:border-border shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_-8px_rgba(3,79,70,0.12)] hover:border-primary/30 hover:-translate-y-1.5'
            } ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.97]'}`}
            style={{ transitionDelay: `${baseDelay}ms` }}
            data-testid={`card-plan-${plan.id}`}
          >
            {plan.featured ? (
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary/80 to-primary/40" />
            ) : (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            )}

            {plan.featured && (
              <div className={`absolute -top-px left-1/2 -translate-x-1/2 translate-y-3 z-10 transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
                style={{ transitionDelay: `${baseDelay + 300}ms` }}
              >
                <span className="bg-primary text-primary-foreground text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.15em] shadow-lg shadow-primary/30" data-testid="badge-popular">
                  Most Popular
                </span>
              </div>
            )}

            <div className={`p-7 lg:p-8 ${plan.featured ? 'pt-10' : ''}`}>
              <h3 className={`text-xl font-extrabold tracking-[-0.03em] text-foreground mb-1 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
                style={{ transitionDelay: `${baseDelay + 200}ms` }}
                data-testid={`text-plan-name-${plan.id}`}
              >
                {plan.name}
              </h3>
              <p className={`text-xs text-muted-foreground mb-5 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionDelay: `${baseDelay + 250}ms` }}
                data-testid={`text-plan-subtitle-${plan.id}`}
              >
                {plan.subtitle}
              </p>

              <div className={`mb-5 transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: `${baseDelay + 300}ms` }}
              >
                <span className={`text-5xl font-bold tracking-tight ${plan.featured ? 'text-primary' : 'text-foreground'}`} data-testid={`text-plan-price-${plan.id}`}>
                  ${plan.price}
                </span>
                <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
              </div>

              <p className={`text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mb-4 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionDelay: `${baseDelay + 350}ms` }}
                data-testid={`text-plan-desc-${plan.id}`}
              >
                {plan.description}
              </p>

              <div className={`border-t border-border/40 pt-5 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionDelay: `${baseDelay + 400}ms` }}
              >
                <ul className="space-y-3 mb-7">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.featured ? 'bg-primary/10' : 'bg-primary/5 group-hover:bg-primary/10'} transition-colors duration-300`}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground leading-snug" data-testid={`text-plan-feature-${plan.id}-${i}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                asChild
                className={`w-full transition-all duration-300 overflow-hidden relative ${plan.featured ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 no-default-hover-elevate btn-glow-effect' : 'group-hover:border-primary/40 group-hover:text-primary'}`}
                variant={plan.featured ? 'default' : 'outline'}
                size="lg"
                data-testid={`button-plan-${plan.id}`}
              >
                <a href={planSignUpUrl(plan.id)} data-plan={plan.id}>
                  <span className="btn-magnetic-text relative z-10">{planCta(plan)}</span>
                </a>
              </Button>
              <a
                href={plan.path}
                className="mt-4 block text-center text-sm font-medium text-primary underline-offset-4 hover:underline"
                data-testid={`link-plan-details-${plan.id}`}
              >
                See everything in {plan.name}
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** The free account stays available next to the paid plans. */
export function FreeAccountNote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-center text-sm text-muted-foreground ${className}`}>
      Not ready to choose a plan?{" "}
      <a href={FREE_SIGN_UP_URL} className="font-semibold text-primary underline-offset-4 hover:underline" data-testid="link-free-account">
        Create a free account
      </a>
    </p>
  );
}
