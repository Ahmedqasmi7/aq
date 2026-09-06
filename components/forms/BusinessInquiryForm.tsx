"use client";

import { useState } from "react";
import {
  INQUIRY_TYPES,
  validateBusinessInquiry,
  type BusinessInquiryPayload,
  type FieldErrors,
} from "@/lib/business-inquiry";

const EMPTY: BusinessInquiryPayload = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  inquiryType: "Corporate Gifting",
  estimatedQuantity: "",
  message: "",
};

type Status = "idle" | "submitting" | "success" | "error";

export function BusinessInquiryForm() {
  const [form, setForm] = useState<BusinessInquiryPayload>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  function update<K extends keyof BusinessInquiryPayload>(key: K, value: BusinessInquiryPayload[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fieldErrors = validateBusinessInquiry(form);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setStatus("submitting");
    setServerMessage(null);
    try {
      const res = await fetch("/api/business-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setServerMessage(data?.message ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      setForm(EMPTY);
    } catch {
      setStatus("error");
      setServerMessage("We couldn't reach the server. Please try again in a moment.");
    }
  }

  if (status === "success") {
    return (
      <div className="velario-glass-panel velario-inquiry-status">
        <h3 className="font-display">Received.</h3>
        <p>
          Thank you — your inquiry is with our business development team. Expect a reply within two
          business days.
        </p>
        <button type="button" className="velario-inquiry-status__reset" onClick={() => setStatus("idle")} data-cursor="hover">
          Submit another inquiry
        </button>
        <style jsx>{`
          .velario-inquiry-status {
            max-width: 560px;
            margin: 0 auto;
            text-align: center;
          }
          .velario-inquiry-status p {
            margin-top: var(--space-sm);
            color: rgba(245, 244, 240, 0.75);
          }
          .velario-inquiry-status__reset {
            margin-top: var(--space-lg);
            background: none;
            border: none;
            color: var(--color-gold);
            text-decoration: underline;
            text-underline-offset: 3px;
            font-size: 0.85rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <form className="velario-form" onSubmit={handleSubmit} noValidate>
      <div className="velario-form__grid">
        <label>
          <span>Company Name</span>
          <input
            type="text"
            value={form.companyName}
            onChange={(e) => update("companyName", e.target.value)}
            aria-invalid={Boolean(errors.companyName)}
          />
          {errors.companyName && <em>{errors.companyName}</em>}
        </label>

        <label>
          <span>Contact Name</span>
          <input
            type="text"
            value={form.contactName}
            onChange={(e) => update("contactName", e.target.value)}
            aria-invalid={Boolean(errors.contactName)}
          />
          {errors.contactName && <em>{errors.contactName}</em>}
        </label>

        <label>
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && <em>{errors.email}</em>}
        </label>

        <label>
          <span>Phone (optional)</span>
          <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
        </label>

        <label>
          <span>Inquiry Type</span>
          <select value={form.inquiryType} onChange={(e) => update("inquiryType", e.target.value as BusinessInquiryPayload["inquiryType"])}>
            {INQUIRY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Estimated Quantity</span>
          <input
            type="text"
            placeholder="e.g. 250 units"
            value={form.estimatedQuantity}
            onChange={(e) => update("estimatedQuantity", e.target.value)}
            aria-invalid={Boolean(errors.estimatedQuantity)}
          />
          {errors.estimatedQuantity && <em>{errors.estimatedQuantity}</em>}
        </label>
      </div>

      <label className="velario-form__full">
        <span>Message</span>
        <textarea
          rows={5}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          aria-invalid={Boolean(errors.message)}
        />
        {errors.message && <em>{errors.message}</em>}
      </label>

      {status === "error" && <p className="velario-form__server-error">{serverMessage}</p>}

      <button type="submit" className="velario-btn-primary" disabled={status === "submitting"} data-cursor="hover">
        {status === "submitting" ? "Sending…" : "Submit Inquiry"}
      </button>

      <style jsx>{`
        .velario-form {
          max-width: 720px;
          margin: 0 auto;
        }
        .velario-form__grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-md);
        }
        .velario-form label {
          display: flex;
          flex-direction: column;
          gap: var(--space-3xs);
          font-size: 0.78rem;
          letter-spacing: 0.04em;
          color: rgba(245, 244, 240, 0.7);
        }
        .velario-form__full {
          margin-top: var(--space-md);
        }
        .velario-form input,
        .velario-form select,
        .velario-form textarea {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--color-line);
          color: var(--color-parchment);
          padding: var(--space-xs);
          font-size: 0.9rem;
          font-family: var(--font-sans), sans-serif;
        }
        .velario-form input:focus,
        .velario-form select:focus,
        .velario-form textarea:focus {
          outline: none;
          border-color: var(--color-gold);
        }
        .velario-form em {
          font-style: normal;
          color: #d98c7a;
          font-size: 0.72rem;
        }
        .velario-form__server-error {
          margin-top: var(--space-md);
          color: #d98c7a;
          font-size: 0.85rem;
        }
        .velario-form :global(.velario-btn-primary) {
          margin-top: var(--space-lg);
          width: auto;
          padding: var(--space-xs) var(--space-2xl);
        }
        @media (max-width: 640px) {
          .velario-form__grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </form>
  );
}
