"use client";
import { useState } from "react";

export default function StartPage() {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  type FormValues = {
    name: string;
    email: string;
    phone: string;
    message: string;
    goals: string;
    painAreas: string;
    activityLevel: string;
    injuries: string;
    preferredTimes: string;
    heardFrom: string;
  };
  const [values, setValues] = useState<FormValues>({
    name: "",
    email: "",
    phone: "",
    message: "",
    goals: "",
    painAreas: "",
    activityLevel: "",
    injuries: "",
    preferredTimes: "",
    heardFrom: "",
  });

  type Step = { key: keyof FormValues; label: string; type: "text" | "email" | "textarea" };
  const steps: Step[] = [
    { key: "name", label: "Your name", type: "text" },
    { key: "email", label: "Email", type: "email" },
    { key: "phone", label: "Phone (optional)", type: "text" },
    { key: "message", label: "What are you seeking?", type: "textarea" },
    { key: "goals", label: "Primary goals (mobility, pain relief, performance)", type: "textarea" },
    { key: "painAreas", label: "Any pain/tight areas?", type: "textarea" },
    { key: "activityLevel", label: "Weekly activity level (hours)", type: "text" },
    { key: "injuries", label: "Past injuries/surgeries (if any)", type: "textarea" },
    { key: "preferredTimes", label: "Preferred times (days/time windows)", type: "text" },
    { key: "heardFrom", label: "How did you hear about us?", type: "text" },
  ];

  function update(key: keyof FormValues, val: string) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  async function submit() {
    setLoading(true);
    setStatus(null);
    const formData = new FormData();
    Object.entries(values).forEach(([k, v]) => formData.append(k, v));
    formData.append("source", "start");
    const answers = {
      goals: values.goals,
      painAreas: values.painAreas,
      activityLevel: values.activityLevel,
      injuries: values.injuries,
      preferredTimes: values.preferredTimes,
      heardFrom: values.heardFrom,
    };
    formData.append("answers", JSON.stringify(answers));
    const res = await fetch("/api/enquiry", { method: "POST", body: formData });
    setLoading(false);
    if (!res.ok) { setStatus("Something went wrong. Please try again."); return; }
    setStatus("Thanks! We'll be in touch shortly.");
    setStep(0);
    setValues({ name: "", email: "", phone: "", message: "", goals: "", painAreas: "", activityLevel: "", injuries: "", preferredTimes: "", heardFrom: "" });
  }

  const current = steps[step];

  return (
    <main className="min-h-screen text-white pt-24 px-6 pb-12">
      <section className="max-w-xl mx-auto">
        <div className="fade-in mb-8">
          <h1 className="heading-serif text-5xl md:text-6xl font-normal mb-2">Start your journey</h1>
          <p className="text-white/60 text-sm tracking-tight">Tell us about yourself and what you&apos;re looking for</p>
        </div>

        <div className="matte-card p-8 fade-in">
          <div className="mb-6">
            <label className="block mb-3 text-white/90 heading-serif text-xl">{current.label}</label>
            {current.type === "text" || current.type === "email" ? (
              <input
                type={current.type}
                value={values[current.key]}
                onChange={(e) => update(current.key, e.target.value)}
                className="input-field w-full"
                placeholder={current.key === 'name' ? 'John Smith' : current.key === 'email' ? 'john@example.com' : ''}
              />
            ) : (
              <textarea
                rows={5}
                value={values[current.key]}
                onChange={(e) => update(current.key, e.target.value)}
                className="input-field w-full resize-none"
                placeholder="Share your thoughts..."
              />
            )}
          </div>

          <div className="mb-4 flex gap-1.5">
            {steps.map((_, i) => (
              <span key={i} className={`h-1 rounded-full transition-all ${i <= step ? "bg-white" : "bg-white/20"}`} style={{ width: `${100 / steps.length}%` }} />
            ))}
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="pill-button px-6 py-2"
              disabled={step === 0}
            >
              Back
            </button>
            {step < steps.length - 1 ? (
              <button onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))} className="pill-button px-6 py-2">
                Next
              </button>
            ) : (
              <button onClick={submit} disabled={loading} className="pill-button px-6 py-2">
                {loading ? "Sending..." : "Submit"}
              </button>
            )}
          </div>
        </div>

        {status && <div className="mt-4 matte-card p-4 text-white/80 text-sm text-center fade-in">{status}</div>}
      </section>
    </main>
  );
}


