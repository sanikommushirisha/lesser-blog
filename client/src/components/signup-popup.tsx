import { useState } from "react";
import { X, ArrowRight, ArrowLeft, Check, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string }) => void;
    };
  }
}

const CALENDLY_URL = "https://calendly.com/lesser-tax/consultationcall-with-lesserteam";

const EQUITY_OPTIONS = [
  { value: "RSUs", label: "RSUs" },
  { value: "ISOs", label: "ISOs" },
  { value: "ESPP", label: "ESPP" },
  { value: "Stock Options", label: "Stock Options" },
  { value: "None", label: "None of these" },
];

const INCOME_RANGES = [
  { value: "under-100k", label: "Under $100K" },
  { value: "100k-250k", label: "$100K – $250K" },
  { value: "250k-500k", label: "$250K – $500K" },
  { value: "500k-1m", label: "$500K – $1M" },
  { value: "1m-plus", label: "$1M+" },
];

interface SignupPopupProps {
  open: boolean;
  onClose: () => void;
  sourcePage: string;
}

export default function SignupPopup({ open, onClose, sourcePage }: SignupPopupProps) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [employmentType, setEmploymentType] = useState("");
  const [equityTypes, setEquityTypes] = useState<string[]>([]);
  const [incomeRange, setIncomeRange] = useState("");
  const [hasCpa, setHasCpa] = useState<boolean | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  function resetAndClose() {
    setStep(1);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setEmploymentType("");
    setEquityTypes([]);
    setIncomeRange("");
    setHasCpa(null);
    setErrors({});
    setSubmitting(false);
    onClose();
  }

  function validateStep1() {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "First name is required";
    if (!lastName.trim()) errs.lastName = "Last name is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email";
    if (!phone.trim()) errs.phone = "Phone number is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep2() {
    const errs: Record<string, string> = {};
    if (!employmentType) errs.employmentType = "Select your employment type";
    if (equityTypes.length === 0) errs.equityTypes = "Select at least one option";
    if (!incomeRange) errs.incomeRange = "Select your income range";
    if (hasCpa === null) errs.hasCpa = "Please answer this question";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function toggleEquity(val: string) {
    if (val === "None") {
      setEquityTypes(equityTypes.includes("None") ? [] : ["None"]);
    } else {
      const without = equityTypes.filter((v) => v !== "None");
      if (without.includes(val)) {
        setEquityTypes(without.filter((v) => v !== val));
      } else {
        setEquityTypes([...without, val]);
      }
    }
  }

  async function handleStep2Continue() {
    if (!validateStep2()) return;
    setSubmitting(true);
    try {
      await apiRequest("POST", "/api/signups", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        employmentType,
        equityTypes: equityTypes.filter((v) => v !== "None"),
        incomeRange,
        hasCpa,
        sourcePage,
      });
      setStep(3);
    } catch {
      setErrors({ submit: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  function openCalendlyAndClose() {
    if (window.Calendly) {
      window.Calendly.initPopupWidget({ url: CALENDLY_URL });
    } else {
      window.open(CALENDLY_URL, "_blank");
    }
    resetAndClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      data-testid="signup-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) resetAndClose();
      }}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        data-testid="signup-modal"
      >
        <button
          onClick={resetAndClose}
          className="absolute top-4 right-4 z-10 p-1 rounded-full hover:bg-gray-100 transition-colors"
          data-testid="button-close-signup"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-[#1C41F7] transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
            data-testid="signup-progress-bar"
          />
        </div>

        <div className="px-8 py-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider" data-testid="text-step-indicator">
              Step {step} of 3
            </span>
          </div>

          {step === 1 && (
            <div data-testid="signup-step-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Let's get started
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Tell us a bit about yourself so we can match you with the right CPA.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border ${errors.firstName ? "border-red-400" : "border-gray-200"} bg-gray-50 focus:bg-white focus:border-[#1C41F7] focus:ring-2 focus:ring-[#1C41F7]/10 outline-none transition-all text-sm`}
                      placeholder="John"
                      data-testid="input-first-name"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1" data-testid="error-first-name">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border ${errors.lastName ? "border-red-400" : "border-gray-200"} bg-gray-50 focus:bg-white focus:border-[#1C41F7] focus:ring-2 focus:ring-[#1C41F7]/10 outline-none transition-all text-sm`}
                      placeholder="Doe"
                      data-testid="input-last-name"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1" data-testid="error-last-name">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.email ? "border-red-400" : "border-gray-200"} bg-gray-50 focus:bg-white focus:border-[#1C41F7] focus:ring-2 focus:ring-[#1C41F7]/10 outline-none transition-all text-sm`}
                    placeholder="john@company.com"
                    data-testid="input-email"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1" data-testid="error-email">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.phone ? "border-red-400" : "border-gray-200"} bg-gray-50 focus:bg-white focus:border-[#1C41F7] focus:ring-2 focus:ring-[#1C41F7]/10 outline-none transition-all text-sm`}
                    placeholder="(555) 123-4567"
                    data-testid="input-phone"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1" data-testid="error-phone">{errors.phone}</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  if (validateStep1()) setStep(2);
                }}
                className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1C41F7] text-white font-semibold rounded-xl hover:bg-[#1533c5] transition-colors text-sm"
                data-testid="button-step1-continue"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-xs text-gray-400 mt-4">
                We'll never share your information with third parties.
              </p>
            </div>
          )}

          {step === 2 && (
            <div data-testid="signup-step-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Your tax profile
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                A few quick questions to personalize your experience.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employment type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["W-2 Employee", "Self-Employed", "Both"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setEmploymentType(opt)}
                        className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                          employmentType === opt
                            ? "border-[#1C41F7] bg-[#1C41F7]/5 text-[#1C41F7]"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                        data-testid={`button-employment-${opt.toLowerCase().replace(/[\s-]/g, "-")}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {errors.employmentType && (
                    <p className="text-red-500 text-xs mt-1" data-testid="error-employment-type">{errors.employmentType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you have equity compensation?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EQUITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => toggleEquity(opt.value)}
                        className={`px-3.5 py-2 rounded-lg border text-sm font-medium transition-all flex items-center gap-1.5 ${
                          equityTypes.includes(opt.value)
                            ? "border-[#1C41F7] bg-[#1C41F7]/5 text-[#1C41F7]"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                        data-testid={`button-equity-${opt.value.toLowerCase().replace(/\s/g, "-")}`}
                      >
                        {equityTypes.includes(opt.value) && <Check className="w-3.5 h-3.5" />}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {errors.equityTypes && (
                    <p className="text-red-500 text-xs mt-1" data-testid="error-equity-types">{errors.equityTypes}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated annual income
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {INCOME_RANGES.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setIncomeRange(opt.value)}
                        className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                          incomeRange === opt.value
                            ? "border-[#1C41F7] bg-[#1C41F7]/5 text-[#1C41F7]"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                        data-testid={`button-income-${opt.value}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {errors.incomeRange && (
                    <p className="text-red-500 text-xs mt-1" data-testid="error-income-range">{errors.incomeRange}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Have you filed taxes with a CPA before?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: true, label: "Yes" },
                      { value: false, label: "No" },
                    ].map((opt) => (
                      <button
                        key={String(opt.value)}
                        onClick={() => setHasCpa(opt.value)}
                        className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                          hasCpa === opt.value
                            ? "border-[#1C41F7] bg-[#1C41F7]/5 text-[#1C41F7]"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                        data-testid={`button-cpa-${opt.value ? "yes" : "no"}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {errors.hasCpa && (
                    <p className="text-red-500 text-xs mt-1" data-testid="error-has-cpa">{errors.hasCpa}</p>
                  )}
                </div>
              </div>

              {errors.submit && (
                <p className="text-red-500 text-sm mt-3 text-center" data-testid="error-submit">{errors.submit}</p>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => { setErrors({}); setStep(1); }}
                  className="flex items-center gap-1.5 px-4 py-3.5 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
                  data-testid="button-step2-back"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleStep2Continue}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1C41F7] text-white font-semibold rounded-xl hover:bg-[#1533c5] disabled:opacity-60 transition-colors text-sm"
                  data-testid="button-step2-continue"
                >
                  {submitting ? "Saving..." : "Continue"}
                  {!submitting && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div data-testid="signup-step-3">
              <div className="text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
                  <Check className="w-7 h-7 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Thanks, {firstName}!
                </h2>
                <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                  Based on your profile, our CPAs can help you save on taxes. Book a free consultation to get started.
                </p>

                <button
                  onClick={openCalendlyAndClose}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#1C41F7] text-white font-semibold rounded-xl hover:bg-[#1533c5] transition-colors text-sm"
                  data-testid="button-book-call"
                >
                  <Calendar className="w-5 h-5" />
                  Book a Free Consultation
                </button>

                <button
                  onClick={resetAndClose}
                  className="mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                  data-testid="button-skip-booking"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
