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
    treatment: string;
    message: string;
  };
  const [values, setValues] = useState<FormValues>({
    name: "",
    email: "",
    phone: "",
    treatment: "",
    message: "",
  });

  type Step = { key: keyof FormValues; label: string; type: "text" | "email" | "select" | "textarea" };
  const steps: Step[] = [
    { key: "name", label: "Your name", type: "text" },
    { key: "email", label: "Email", type: "email" },
    { key: "phone", label: "Phone (optional)", type: "text" },
    { key: "treatment", label: "Treatment (optional)", type: "select" },
    { key: "message", label: "What are you seeking?", type: "textarea" },
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
    const res = await fetch("/api/enquiry", { method: "POST", body: formData });
    setLoading(false);
    if (!res.ok) { setStatus("Something went wrong. Please try again."); return; }
    setStatus("Thanks! We'll be in touch shortly.");
    setStep(0);
    setValues({ name: "", email: "", phone: "", treatment: "", message: "" });
  }

  const current = steps[step];

  return (
    <main className="min-h-screen text-white pt-24 px-6">
      <section className="max-w-xl mx-auto">
        <h1 className="heading-serif text-5xl font-light mb-8">Start your journey</h1>

        <div className="rounded-2xl border border-white/15 bg-black/30 backdrop-blur p-6">
          <label className="block mb-2 text-white/90 heading-serif text-lg">{current.label}</label>
          {current.type === "text" || current.type === "email" ? (
            <input
              type={current.type}
              value={values[current.key]}
              onChange={(e) => update(current.key, e.target.value)}
              className="w-full bg-transparent border border-white/30 rounded-md px-4 py-3 placeholder-white/60 focus:outline-none"
            />
          ) : current.type === "select" ? (
            <select
              value={values.treatment}
              onChange={(e) => update("treatment", e.target.value)}
              className="w-full bg-transparent border border-white/30 rounded-md px-4 py-3 text-white"
            >
              <option value="" className="text-black">Select a treatment</option>
              <option value="massage" className="text-black">Massage</option>
              <option value="wet_cupping" className="text-black">Wet cupping</option>
              <option value="dry_cupping" className="text-black">Dry cupping</option>
              <option value="contrast" className="text-black">Cold plunge & sauna</option>
            </select>
          ) : (
            <textarea
              rows={5}
              value={values.message}
              onChange={(e) => update("message", e.target.value)}
              className="w-full bg-transparent border border-white/30 rounded-md px-4 py-3 placeholder-white/60 focus:outline-none"
            />
          )}

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="pill-button"
              disabled={step === 0}
            >
              Back
            </button>
            {step < steps.length - 1 ? (
              <button onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))} className="pill-button">
                Next
              </button>
            ) : (
              <button onClick={submit} disabled={loading} className="pill-button">
                {loading ? "Sending..." : "Submit"}
              </button>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            {steps.map((_, i) => (
              <span key={i} className={`h-1 rounded-full ${i <= step ? "bg-white" : "bg-white/30"}`} style={{ width: `${100 / steps.length}%` }} />
            ))}
          </div>
        </div>

        {status && <p className="mt-4 text-white/80">{status}</p>}
      </section>
    </main>
  );
}


