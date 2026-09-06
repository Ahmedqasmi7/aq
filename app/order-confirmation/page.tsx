import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { ClearCartOnMount } from "@/components/order/ClearCartOnMount";

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Your VELARIO order has been confirmed.",
};

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; total?: string }>;
}) {
  const { order, total } = await searchParams;

  return (
    <>
      <ClearCartOnMount />
      <PageHero
        eyebrow="Order Confirmed"
        title="Your flacon is on its way."
        subtitle={
          order
            ? `Order ${order}${total ? ` · $${total}` : ""} has been received. A confirmation email with tracking follows shortly.`
            : "Your order has been received. A confirmation email with tracking follows shortly."
        }
      >
        <div className="velario-confirmation__actions">
          <Link href="/" className="velario-btn-primary" data-cursor="hover">
            Return Home
          </Link>
          <Link href="/help#shipping" data-cursor="hover">
            Track My Order →
          </Link>
        </div>
      </PageHero>

      <style>{`
        .velario-confirmation__actions {
          margin-top: var(--space-lg);
          display: flex;
          gap: var(--space-lg);
          align-items: center;
          justify-content: center;
        }
        .velario-confirmation__actions :global(.velario-btn-primary) {
          text-decoration: none;
          width: auto;
          padding: var(--space-xs) var(--space-xl);
        }
        .velario-confirmation__actions a:not(.velario-btn-primary) {
          color: var(--color-gold);
          text-decoration: none;
          font-size: 0.9rem;
        }
      `}</style>
    </>
  );
}
