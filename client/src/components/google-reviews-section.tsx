import { useState, useEffect, useRef, useCallback } from "react";
import { Star, Clock } from "lucide-react";

const GOOGLE_REVIEWS = [
  {
    id: "gr1",
    name: "Pavan Pullugulla",
    role: "9 reviews",
    initial: "P",
    quote: "They are really good at handling taxes. Starting from reaching out and helping with estimates and then proceeding with final submission, everything felt smooth and good.",
    rating: 5,
    timeAgo: "a week ago",
  },
  {
    id: "gr2",
    name: "Srujana Dusari",
    role: "1 review",
    initial: "S",
    quote: "I've had a very positive experience with Lesser Tax. They are highly professional, listened to our concerns, and provided solutions accordingly. I especially appreciated the tax strategy planning reports they shared with us this year — they took the time to discuss everything in detail and offered valuable suggestions.",
    rating: 5,
    timeAgo: "3 months ago",
  },
  {
    id: "gr3",
    name: "Shawn Benny",
    role: "2 reviews",
    initial: "S",
    quote: "I had a great experience working with Danish and the Lesser Tax team to file my 2024 taxes. They were incredibly responsive and took the time to answer all my questions thoroughly. One of the standout aspects was the expert review after I had input all my information. I highly recommend Lesser Tax if you're a self-employed freelancer or need reliable support for your business taxes.",
    rating: 5,
    timeAgo: "11 months ago",
  },
  {
    id: "gr4",
    name: "Yamini Swetha Gudibandi",
    role: "1 review",
    initial: "Y",
    quote: "I had a great experience with Lesser Tax. They were reliable, thorough, and genuinely cared about helping me get the most out of my tax refund. What really stood out was how they took the time to explain everything and gave me practical tips to plan my income better and save on taxes. It didn't feel like a one-time service — they helped me think long-term.",
    rating: 5,
    timeAgo: "a year ago",
  },
  {
    id: "gr5",
    name: "Suvashis Nandy",
    role: "10 reviews · 1 photo",
    initial: "S",
    quote: "Lesser tax has been phenomenal working on my complex tax filing. Their knowledge of the subject is too wide and vast which helped me structure and accurate filing of my taxes besides the smoothness and easy filing process.",
    rating: 5,
    timeAgo: "a year ago",
  },
  {
    id: "gr6",
    name: "Kandagatla Alekya",
    role: "1 review",
    initial: "K",
    quote: "I had a fantastic experience with lesser Tax. The team was professional, knowledgeable, and incredibly patient in answering all my questions. They ensured every deduction and credit I was eligible for was accounted for, and the process was smooth from start to finish. Their attention to detail and quick turnaround time gave me complete peace of mind. Highly recommend their services for anyone looking for tax filing!",
    rating: 5,
    timeAgo: "a year ago",
  },
];

const GOOGLE_MAPS_EMBED_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.5!2d-122.3952658!3d37.7750361!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808f7f4a4b7a6e09%3A0x43d4cd5241489044!2sLesser%20Tax!5e0!3m2!1sen!2sus!4v1";
const GOOGLE_MAPS_LINK = "https://www.google.com/maps/place/Lesser+Tax/@37.7750361,-122.3952658,17z";
const GOOGLE_PROFILE_LINK = "https://share.google/duASFhWVX4lpV3gHS";

function GoogleLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function useCountUp(target: number, duration: number, trigger: boolean) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!trigger) return;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(parseFloat((target * eased).toFixed(1)));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [trigger, target, duration]);

  return value;
}

function ReviewCard({ review, index }: { review: typeof GOOGLE_REVIEWS[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current || !innerRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    innerRef.current.style.transform = `rotateX(${y * -8}deg) rotateY(${x * 8}deg) translateZ(0)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (innerRef.current) {
      innerRef.current.style.transform = "rotateX(0deg) rotateY(0deg) translateZ(0)";
    }
  }, []);

  const gradientColors = [
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-violet-500 to-purple-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600",
    "from-cyan-500 to-blue-600",
  ];

  return (
    <div
      ref={cardRef}
      className="google-review-card group"
      style={{
        perspective: "1000px",
        animationDelay: `${index * 120}ms`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-testid={`card-google-review-${review.id}`}
    >
      <div
        ref={innerRef}
        className="relative h-full bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-white/60 dark:border-white/10 p-6 transition-all duration-300 ease-out group-hover:shadow-[0_8px_40px_-8px_rgba(28,65,247,0.15)] group-hover:border-primary/20"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        <div className="shimmer-border-overlay" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradientColors[index % gradientColors.length]} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
              {review.initial}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground leading-tight" data-testid={`text-reviewer-name-${review.id}`}>{review.name}</p>
              <p className="text-xs text-muted-foreground">{review.role}</p>
            </div>
          </div>
          <GoogleLogo className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="flex items-center gap-0.5 mb-3">
          {Array.from({ length: review.rating }).map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
          ))}
        </div>

        <blockquote className="text-sm text-foreground/80 leading-relaxed mb-4 line-clamp-4" data-testid={`text-review-quote-${review.id}`}>
          "{review.quote}"
        </blockquote>

        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          {review.timeAgo}
        </p>
      </div>
    </div>
  );
}

export default function GoogleReviewsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const ratingValue = useCountUp(5.0, 1800, isVisible);
  const reviewCount = Math.round(useCountUp(24, 1800, isVisible));

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInnerRef = useRef<HTMLDivElement>(null);

  const handleMapMouseMove = useCallback((e: React.MouseEvent) => {
    if (!mapRef.current || !mapInnerRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mapInnerRef.current.style.transform = `rotateX(${y * -4}deg) rotateY(${x * 4}deg)`;
  }, []);

  const handleMapMouseLeave = useCallback(() => {
    if (mapInnerRef.current) {
      mapInnerRef.current.style.transform = "rotateX(0deg) rotateY(0deg)";
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-20 lg:py-28 overflow-hidden"
      data-testid="section-google-reviews"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-transparent to-muted/30 pointer-events-none" />

      {isVisible && (
        <>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="google-float-star"
              aria-hidden="true"
              style={{
                left: `${10 + i * 11}%`,
                animationDelay: `${i * 0.7}s`,
                animationDuration: `${4 + (i % 3) * 1.5}s`,
              }}
            >
              <Star className="w-3 h-3 fill-amber-300/40 text-amber-300/40" />
            </div>
          ))}
        </>
      )}

      <div className="max-w-7xl mx-auto px-6">
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/40 text-amber-700 dark:text-amber-300 text-xs font-medium mb-6" data-testid="badge-google-reviews">
            <GoogleLogo className="w-4 h-4" />
            Google Reviews
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-6" data-testid="text-google-reviews-heading">
            Trusted by Clients on{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#FBBC05]">
              Google
            </span>
          </h2>

          <div className={`inline-flex items-center gap-4 bg-white dark:bg-white/5 rounded-2xl px-8 py-5 shadow-lg border border-border/50 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"}`} data-testid="badge-google-rating">
            <div className="text-center">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-foreground google-rating-glow" data-testid="text-google-rating">
                  {ratingValue.toFixed(1)}
                </span>
                <span className="text-lg text-muted-foreground font-medium">/5</span>
              </div>
              <div className="flex items-center justify-center gap-0.5 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground" data-testid="text-review-count">{reviewCount}+</p>
              <p className="text-sm text-muted-foreground">Reviews</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <a
              href={GOOGLE_PROFILE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              data-testid="link-google-profile"
            >
              <GoogleLogo className="w-6 h-6" />
              <span className="hidden sm:inline">View Profile</span>
            </a>
          </div>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16 ${isVisible ? "google-cards-visible" : ""}`}>
          {GOOGLE_REVIEWS.map((review, index) => (
            <ReviewCard key={review.id} review={review} index={index} />
          ))}
        </div>

        <div
          ref={mapRef}
          className={`relative transition-all duration-1000 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
          style={{ perspective: "1200px" }}
          onMouseMove={handleMapMouseMove}
          onMouseLeave={handleMapMouseLeave}
          data-testid="container-google-map"
        >
          <div
            ref={mapInnerRef}
            className="relative rounded-3xl overflow-hidden google-map-glow-border transition-transform duration-300 ease-out"
          >
            <iframe
              src={GOOGLE_MAPS_EMBED_URL}
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lesser Tax on Google Maps"
              className="w-full h-[300px] md:h-[400px]"
              data-testid="iframe-google-map"
            />

          </div>
        </div>
      </div>
    </section>
  );
}
