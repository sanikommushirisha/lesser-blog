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

const BUSINESS_TYPES = [
  { value: "C-Corp", label: "C-Corp" },
  { value: "S-Corp", label: "S-Corp" },
  { value: "Partnership", label: "Partnership" },
  { value: "LLC", label: "LLC" },
  { value: "Sole Proprietor", label: "Sole Proprietor" },
];

const FORM_TYPES = [
  { value: "Form 1120", label: "Form 1120 (C-Corp)" },
  { value: "Form 1120-S", label: "Form 1120-S (S-Corp)" },
  { value: "Form 1065", label: "Form 1065 (Partnership/LLC)" },
  { value: "Not Sure", label: "Not sure" },
];

const REVENUE_RANGES = [
  { value: "under-100k", label: "Under $100K" },
  { value: "100k-500k", label: "$100K – $500K" },
  { value: "500k-1m", label: "$500K – $1M" },
  { value: "1m-5m", label: "$1M – $5M" },
  { value: "5m-plus", label: "$5M+" },
];

interface BusinessSignupPopupProps {
  open: boolean;
  onClose: () => void;
  sourcePage: string;
}

export default function BusinessSignupPopup({ open, onClose, sourcePage }: BusinessSignupPopupProps) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");

  const [businessType, setBusinessType] = useState("");
  const [formType, setFormType] = useState("");
  const [annualRevenue, setAnnualRevenue] = useState("");
  const [stateOfIncorporation, setStateOfIncorporation] = useState("");
  const [hasFiledBefore, setHasFiledBefore] = useState<boolean | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  function resetAndClose() {
    setStep(1);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setBusinessName("");
    setBusinessType("");
    setFormType("");
    setAnnualRevenue("");
    setStateOfIncorporation("");
    setHasFiledBefore(null);
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
    if (!businessName.trim()) errs.businessName = "Business name is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep2() {
    const errs: Record<string, string> = {};
    if (!businessType) errs.businessType = "Select your business type";
    if (!formType) errs.formType = "Select the form type";
    if (!annualRevenue) errs.annualRevenue = "Select your revenue range";
    if (hasFiledBefore === null) errs.hasFiledBefore = "Please answer this question";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleStep2Continue() {
    if (!validateStep2()) return;
    setSubmitting(true);
    try {
      await apiRequest("POST", "/api/business-signups", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        businessName: businessName.trim(),
        businessType,
        formType,
        annualRevenue,
        stateOfIncorporation: stateOfIncorporation.trim() || undefined,
        hasFiledBefore,
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
      data-testid="business-signup-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) resetAndClose();
      }}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        data-testid="business-signup-modal"
      >
        <button
          onClick={resetAndClose}
          className="absolute top-4 right-4 z-10 p-1 rounded-full hover:bg-gray-100 transition-colors"
          data-testid="button-close-business-signup"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-[#034f46] transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
            data-testid="business-signup-progress-bar"
          />
        </div>

        <div className="px-8 py-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider" data-testid="text-business-step-indicator">
              Step {step} of 3
            </span>
          </div>

          {step === 1 && (
            <div data-testid="business-signup-step-1">
              <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-gray-900 mb-1">
                Tell us about your business
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                We'll match you with the right team for your business filing.
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
                      className={`w-full px-4 py-3 rounded-lg border ${errors.firstName ? "border-red-400" : "border-gray-200"} bg-gray-50 focus:bg-white focus:border-[#034f46] focus:ring-2 focus:ring-[#034f46]/10 outline-none transition-all text-sm`}
                      placeholder="John"
                      data-testid="input-business-first-name"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1" data-testid="error-business-first-name">{errors.firstName}</p>
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
                      className={`w-full px-4 py-3 rounded-lg border ${errors.lastName ? "border-red-400" : "border-gray-200"} bg-gray-50 focus:bg-white focus:border-[#034f46] focus:ring-2 focus:ring-[#034f46]/10 outline-none transition-all text-sm`}
                      placeholder="Doe"
                      data-testid="input-business-last-name"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1" data-testid="error-business-last-name">{errors.lastName}</p>
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
                    className={`w-full px-4 py-3 rounded-lg border ${errors.email ? "border-red-400" : "border-gray-200"} bg-gray-50 focus:bg-white focus:border-[#034f46] focus:ring-2 focus:ring-[#034f46]/10 outline-none transition-all text-sm`}
                    placeholder="john@company.com"
                    data-testid="input-business-email"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1" data-testid="error-business-email">{errors.email}</p>
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
                    className={`w-full px-4 py-3 rounded-lg border ${errors.phone ? "border-red-400" : "border-gray-200"} bg-gray-50 focus:bg-white focus:border-[#034f46] focus:ring-2 focus:ring-[#034f46]/10 outline-none transition-all text-sm`}
                    placeholder="(555) 123-4567"
                    data-testid="input-business-phone"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1" data-testid="error-business-phone">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.businessName ? "border-red-400" : "border-gray-200"} bg-gray-50 focus:bg-white focus:border-[#034f46] focus:ring-2 focus:ring-[#034f46]/10 outline-none transition-all text-sm`}
                    placeholder="Acme Inc."
                    data-testid="input-business-name"
                  />
                  {errors.businessName && (
                    <p className="text-red-500 text-xs mt-1" data-testid="error-business-name">{errors.businessName}</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  if (validateStep1()) setStep(2);
                }}
                className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#034f46] text-white font-semibold rounded-xl hover:bg-[#023d35] transition-colors text-sm"
                data-testid="button-business-step1-continue"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-xs text-gray-500 mt-4">
                We'll never share your information with third parties.
              </p>
            </div>
          )}

          {step === 2 && (
            <div data-testid="business-signup-step-2">
              <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-gray-900 mb-1">
                Business details
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Help us understand your filing needs.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {BUSINESS_TYPES.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setBusinessType(opt.value)}
                        className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                          businessType === opt.value
                            ? "border-[#034f46] bg-[#034f46]/5 text-[#034f46]"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                        data-testid={`button-business-type-${opt.value.toLowerCase().replace(/[\s-]/g, "-")}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {errors.businessType && (
                    <p className="text-red-500 text-xs mt-1" data-testid="error-business-type">{errors.businessType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Which form do you need filed?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {FORM_TYPES.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setFormType(opt.value)}
                        className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all text-left ${
                          formType === opt.value
                            ? "border-[#034f46] bg-[#034f46]/5 text-[#034f46]"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                        data-testid={`button-form-type-${opt.value.toLowerCase().replace(/[\s()\/]/g, "-")}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {errors.formType && (
                    <p className="text-red-500 text-xs mt-1" data-testid="error-form-type">{errors.formType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual revenue
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {REVENUE_RANGES.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setAnnualRevenue(opt.value)}
                        className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                          annualRevenue === opt.value
                            ? "border-[#034f46] bg-[#034f46]/5 text-[#034f46]"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                        data-testid={`button-revenue-${opt.value}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {errors.annualRevenue && (
                    <p className="text-red-500 text-xs mt-1" data-testid="error-annual-revenue">{errors.annualRevenue}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State of incorporation (optional)
                  </label>
                  <input
                    type="text"
                    value={stateOfIncorporation}
                    onChange={(e) => setStateOfIncorporation(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#034f46] focus:ring-2 focus:ring-[#034f46]/10 outline-none transition-all text-sm"
                    placeholder="e.g. Delaware, California"
                    data-testid="input-state-incorporation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Have you filed business taxes before?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: true, label: "Yes" },
                      { value: false, label: "No" },
                    ].map((opt) => (
                      <button
                        key={String(opt.value)}
                        onClick={() => setHasFiledBefore(opt.value)}
                        className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                          hasFiledBefore === opt.value
                            ? "border-[#034f46] bg-[#034f46]/5 text-[#034f46]"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                        data-testid={`button-filed-before-${opt.value ? "yes" : "no"}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {errors.hasFiledBefore && (
                    <p className="text-red-500 text-xs mt-1" data-testid="error-filed-before">{errors.hasFiledBefore}</p>
                  )}
                </div>
              </div>

              {errors.submit && (
                <p className="text-red-500 text-sm mt-3 text-center" data-testid="error-business-submit">{errors.submit}</p>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => { setErrors({}); setStep(1); }}
                  className="flex items-center gap-1.5 px-4 py-3.5 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
                  data-testid="button-business-step2-back"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleStep2Continue}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-[#034f46] text-white font-semibold rounded-xl hover:bg-[#023d35] disabled:opacity-60 transition-colors text-sm"
                  data-testid="button-business-step2-continue"
                >
                  {submitting ? "Saving..." : "Continue"}
                  {!submitting && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div data-testid="business-signup-step-3">
              <div className="text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-[#ecfdf5] flex items-center justify-center mb-4">
                  <Check className="w-7 h-7 text-[#059669]" />
                </div>
                <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-gray-900 mb-2">
                  Thanks, {firstName}!
                </h2>
                <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                  We've received your business filing request. Book a free consultation to get started.
                </p>

                <button
                  onClick={openCalendlyAndClose}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#034f46] text-white font-semibold rounded-xl hover:bg-[#023d35] transition-colors text-sm"
                  data-testid="button-business-book-call"
                >
                  <Calendar className="w-5 h-5" />
                  Book a Free Consultation
                </button>

                <button
                  onClick={resetAndClose}
                  className="mt-3 text-sm text-gray-500 hover:text-gray-600 transition-colors"
                  data-testid="button-business-skip-booking"
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
