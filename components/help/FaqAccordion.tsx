"use client";

import { useMemo, useState } from "react";

type FaqItem = { question: string; answer: string; category: string };

const FAQS: FaqItem[] = [
  {
    category: "Shipping & Delivery",
    question: "How long does shipping take?",
    answer: "Domestic orders ship within 1-2 business days and arrive in 2-5 days via insured courier. International orders take 7-14 business days depending on customs processing.",
  },
  {
    category: "Shipping & Delivery",
    question: "Do you ship internationally?",
    answer: "Yes — we ship to over 40 countries. Duties and import taxes are calculated at checkout so there are no surprises on delivery.",
  },
  {
    category: "Returns & Exchanges",
    question: "What is your return policy?",
    answer: "Unopened flacons may be returned within 30 days of delivery for a full refund. Opened flacons are eligible for store credit within 14 days if fewer than 10% of the contents have been used.",
  },
  {
    category: "Returns & Exchanges",
    question: "How do I start a return?",
    answer: "Email returns@wearvelario.com with your order number. We'll send a prepaid label — returns are always free.",
  },
  {
    category: "Fragrance Care & Longevity",
    question: "How should I store my fragrance?",
    answer: "Keep it out of direct sunlight and away from heat — a drawer or cabinet, not a bathroom shelf. Stored properly, an unopened flacon holds its composition for 5+ years.",
  },
  {
    category: "Fragrance Care & Longevity",
    question: "Why is VELARIO's longevity so much stronger than other brands?",
    answer: "Every composition ships at extrait de parfum concentration (20-30% aromatic compounds) — roughly double the industry-standard eau de parfum most houses sell at this price point.",
  },
  {
    category: "Order Tracking",
    question: "Where is my order?",
    answer: "You'll receive a tracking link by email the moment your order ships. If it's been more than 3 business days with no tracking update, contact us and we'll look into it directly.",
  },
  {
    category: "Payment",
    question: "What payment methods do you accept?",
    answer: "All major credit cards, Apple Pay, Google Pay, and Shop Pay installments at checkout.",
  },
  {
    category: "Payment",
    question: "Is my payment information secure?",
    answer: "Yes — checkout runs on Shopify's PCI-compliant infrastructure. VELARIO never stores your card details.",
  },
];

export function FaqAccordion() {
  const [query, setQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filtered = useMemo(() => {
    if (!query.trim()) return FAQS;
    const q = query.toLowerCase();
    return FAQS.filter(
      (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
    );
  }, [query]);

  const grouped = useMemo(() => {
    const map = new Map<string, FaqItem[]>();
    for (const item of filtered) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return map;
  }, [filtered]);

  return (
    <div className="velario-faq">
      <input
        type="search"
        className="velario-faq__search"
        placeholder="Search shipping, returns, care…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search FAQs"
      />

      {filtered.length === 0 && <p className="velario-faq__empty">No results — try a different search, or reach out below.</p>}

      {Array.from(grouped.entries()).map(([category, items]) => (
        <div key={category} className="velario-faq__category">
          <h3 className="eyebrow">{category}</h3>
          {items.map((item) => {
            const index = FAQS.indexOf(item);
            const open = openIndex === index;
            return (
              <div key={item.question} className="velario-faq__item">
                <button
                  type="button"
                  className="velario-faq__question"
                  onClick={() => setOpenIndex(open ? null : index)}
                  aria-expanded={open}
                  data-cursor="hover"
                >
                  {item.question}
                  <span>{open ? "−" : "+"}</span>
                </button>
                {open && <p className="velario-faq__answer">{item.answer}</p>}
              </div>
            );
          })}
        </div>
      ))}

      <style jsx>{`
        .velario-faq {
          max-width: 720px;
          margin: 0 auto;
        }
        .velario-faq__search {
          width: 100%;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--color-line);
          color: var(--color-parchment);
          padding: var(--space-sm);
          font-size: 1rem;
          margin-bottom: var(--space-xl);
        }
        .velario-faq__search:focus {
          outline: none;
          border-color: var(--color-gold);
        }
        .velario-faq__category {
          margin-bottom: var(--space-lg);
        }
        .velario-faq__category h3 {
          margin-bottom: var(--space-sm);
        }
        .velario-faq__item {
          border-bottom: 1px solid var(--color-line);
        }
        .velario-faq__question {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: none;
          border: none;
          color: var(--color-parchment);
          font-family: var(--font-display), serif;
          font-size: 1.05rem;
          padding: var(--space-sm) 0;
          text-align: left;
        }
        .velario-faq__question:hover {
          color: var(--color-gold);
        }
        .velario-faq__answer {
          padding-bottom: var(--space-sm);
          color: rgba(245, 244, 240, 0.7);
          font-size: 0.9rem;
          line-height: 1.6;
        }
        .velario-faq__empty {
          text-align: center;
          color: rgba(245, 244, 240, 0.5);
        }
      `}</style>
    </div>
  );
}
