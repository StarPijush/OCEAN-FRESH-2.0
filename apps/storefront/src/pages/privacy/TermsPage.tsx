import { formatLegalDate, LEGAL_LAST_UPDATED_ISO } from '@oceanfresh/shared';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Footer } from '../../components/layout/Footer.js';
import { useSettings } from '../../context/settings-context.js';

export function TermsPage() {
  const settings = useSettings();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div id="page-terms" className="page active">
      <div className="legal-shell">
        <p className="legal-eyebrow">Legal · Terms</p>
        <h1 className="legal-title">
          Terms & Conditions
          <br />
          <em>Terms of Service</em>
        </h1>
        <div className="legal-rule" aria-hidden="true" />
        <p className="legal-updated">
          <strong>Last updated:</strong> {formatLegalDate(LEGAL_LAST_UPDATED_ISO)} · These Terms
          describe the rules for ordering from OceanFresh’s storefront: product information, pricing
          authority, Cash on Delivery, delivery area, cancellations and responsibilities. They are
          based on our actual checkout flow — not a generic template.
        </p>

        <div className="legal-summary" role="note" aria-label="Quick summary">
          <div className="legal-summary__label">Quick summary</div>
          <p className="legal-summary__text">
            Browse products, add by weight, and check out as a guest — no registration required
            today. Prices are verified at checkout; the total includes delivery (free above ₹
            {settings.freeDeliveryAbove}). Orders are <strong>Cash on Delivery</strong> and
            confirmed via WhatsApp to <code>wa.me/{settings.orderWhatsApp}</code>. We deliver in
            about 2–3 hours within our Jhargram service area (specific pincodes). See below for
            availability, pricing, delivery, cancellations and your responsibilities.
          </p>
        </div>

        <nav className="legal-toc" aria-label="Contents">
          <div className="legal-toc__title">On this page</div>
          <ol className="legal-toc__list">
            <li>
              <a href="#who-we-are">1. Who we are</a>
            </li>
            <li>
              <a href="#ordering">2. Ordering and account</a>
            </li>
            <li>
              <a href="#products-availability">3. Products and availability</a>
            </li>
            <li>
              <a href="#pricing">4. Pricing and total</a>
            </li>
            <li>
              <a href="#payment-cod">5. Payment — Cash on Delivery</a>
            </li>
            <li>
              <a href="#delivery-area">6. Delivery — service area, timing, location</a>
            </li>
            <li>
              <a href="#cancellation">7. Cancellation before dispatch</a>
            </li>
            <li>
              <a href="#returns-refusal">8. Wrong / damaged / refused delivery</a>
            </li>
            <li>
              <a href="#customer-duties">9. Your responsibilities</a>
            </li>
            <li>
              <a href="#acceptable-use">10. Acceptable use</a>
            </li>
            <li>
              <a href="#ip">11. Intellectual property</a>
            </li>
            <li>
              <a href="#availability-liability">12. Service availability and liability</a>
            </li>
            <li>
              <a href="#law">13. Governing law and grievance</a>
            </li>
            <li>
              <a href="#contact">14. Contact</a>
            </li>
            <li>
              <a href="#changes">15. Changes to Terms</a>
            </li>
          </ol>
        </nav>

        <section id="who-we-are" className="legal-section">
          <h2>1. Who we are</h2>
          <p>
            OceanFresh operates the storefront at the domain you are on, serving Jhargram, West
            Bengal. References to “OceanFresh”, “we”, “us” mean the operator of this storefront.
          </p>
          <div className="legal-contact">
            <div className="legal-contact__row">
              <strong>Trading as:</strong> {settings.storeName} · {settings.tagline}
            </div>
            <div className="legal-contact__row">
              <strong>Shop address:</strong> {settings.addressLines[0]}, {settings.addressLines[1]}
            </div>
            <div className="legal-contact__row">
              <strong>Email:</strong> <a href={`mailto:${settings.email}`}>{settings.email}</a>
            </div>
            <div className="legal-contact__row">
              <strong>Phone / WhatsApp:</strong> {settings.phoneDisplay} ·{' '}
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                wa.me/{settings.whatsapp}
              </a>
            </div>
            <div className="legal-contact__row">
              <strong>Hours:</strong> {settings.hours.join(' · ')} · <strong>Est.</strong>{' '}
              {settings.foundedYear}
            </div>
          </div>
          <p>
            Where registration, GSTIN, FSSAI or other statutory details are required on invoices, we
            will provide them on request and will publish them here when finalised. See{' '}
            <Link to="/privacy">Privacy Policy</Link> for how we handle personal information.
          </p>
        </section>

        <section id="ordering" className="legal-section">
          <h2>2. Ordering and account</h2>
          <p>
            You can order as a <strong>guest</strong> — no account or password required. Enter your
            name, phone and delivery address at checkout, choose weights, and tap “Send Order via
            WhatsApp”.
          </p>
          <ul>
            <li>
              Email/password and email-OTP pages exist for support but are not required for ordering
              today and are not linked from the main navigation.
            </li>
            <li>
              You are responsible for ensuring the name, phone and address you enter are accurate
              and reachable at delivery time.
            </li>
            <li>
              By tapping “Send Order via WhatsApp”, you confirm the cart, totals and delivery
              details you see and agree to be contacted on the phone/WhatsApp you provided about
              this order.
            </li>
          </ul>
          <div className="legal-notice">
            Creating an account does not currently give order history in the storefront for guests.
            If account features are added, this section will be updated.
          </div>
        </section>

        <section id="products-availability" className="legal-section">
          <h2>3. Products and availability</h2>
          <p>
            Seafood is sourced daily before sunrise from the local Jhargram market. Availability and
            freshness depend on market supply the same morning.
          </p>
          <ul>
            <li>
              A product shown as available may become unavailable before we process your order — we
              will inform you via phone/WhatsApp in that case.
            </li>
            <li>Weights are selected by you (grams/kg) and priced by our per-kg price.</li>
            <li>Images are for illustration; the catch may vary slightly by size.</li>
            <li>We buy early, handle chilled and weigh on calibrated scales — see Our Story.</li>
          </ul>
        </section>

        <section id="pricing" className="legal-section">
          <h2>4. Pricing and total</h2>
          <p>
            Prices are shown per kg (₹) and calculated for the weight you choose. At checkout we
            verify each line total and price per kg against our database before creating the order;
            if a price was manipulated, the order is rejected with “Price tamper detected”.
          </p>
          <ul>
            <li>
              <strong>Subtotal</strong> = sum of line totals
            </li>
            <li>
              <strong>Delivery</strong> = ₹{settings.deliveryFee} if subtotal &lt; ₹
              {settings.freeDeliveryAbove}, otherwise free
            </li>
            <li>
              <strong>Total</strong> = subtotal + delivery
            </li>
          </ul>
          <p>
            Delivery threshold and fee are live from our shop settings (admin → Supabase →
            storefront). Prices may change between adding to cart and checkout — the price at
            checkout confirmation is authoritative.
          </p>
        </section>

        <section id="payment-cod" className="legal-section">
          <h2>5. Payment — Cash on Delivery only</h2>
          <p>
            Today the storefront accepts <strong>only Cash on Delivery (COD)</strong>. You pay in
            cash to the delivery team. There is no card, UPI, wallet, EMI or link-payment step in
            the storefront.
          </p>
          <ul>
            <li>We do not collect, store or transmit card numbers, CVVs, or UPI IDs</li>
            <li>
              No payment gateway is integrated today (no Razorpay, etc.) — payment fields do not
              exist in <code>order.tsx</code>
            </li>
            <li>
              The order record stores <code>payment: &#123;method: &apos;COD&apos;&#125;</code> with
              null transaction fields
            </li>
          </ul>
          <p>
            If online payment is introduced, we will name the provider, describe what is shared with
            it, and update the Privacy Policy accordingly. Card details would be handled by that
            provider, not by OceanFresh.
          </p>
        </section>

        <section id="delivery-area" className="legal-section">
          <h2>6. Delivery — service area, timing, location</h2>
          <h3>Where we deliver</h3>
          <p>
            We deliver within our Jhargram service area (up to {settings.deliveryRadius} km radius;
            specific pincodes and neighbourhoods shown at checkout and on the Contact page).
          </p>
          <div className="legal-card">
            <div className="legal-card__title">Current service pincodes</div>
            <div className="legal-card__meta">{settings.pincodes.join(' · ')}</div>
          </div>
          <div className="legal-card">
            <div className="legal-card__title">Areas we name</div>
            <div className="legal-card__meta">{settings.deliveryAreas.join(' · ')}</div>
          </div>
          <p>
            Enter your pincode in “Service Area — Deliver to You?” to check eligibility before
            checkout.
          </p>
          <h3>When we deliver</h3>
          <p>
            We aim to deliver within <strong>2–3 hours</strong> after WhatsApp confirmation during
            shop hours ({settings.hours.join(' · ')}), subject to market supply and conditions. The
            2–3 hour window is a target, not a guaranteed SLA for every order.
          </p>
          <h3>Location sharing</h3>
          <p>
            Tapping “Use My Current Location” shares your browser’s lat/lng once; we store a Google
            Maps link in order notes and include it in the WhatsApp message for navigation only. It
            is optional — you may decline and rely on address alone.
          </p>
          <h3>What happens on WhatsApp handoff</h3>
          <p>
            After we save the order to Supabase, your browser opens{' '}
            <code>https://wa.me/{settings.orderWhatsApp}</code> with your name, phone, cart,
            address, totals and optional location pre-filled. You send it to confirm. That message
            is subject to WhatsApp’s terms.
          </p>
        </section>

        <section id="cancellation" className="legal-section">
          <h2>7. Cancellation before dispatch</h2>
          <p>
            Because fresh fish is procured the same morning for your order, we encourage prompt
            cancellation if needed.
          </p>
          <ul>
            <li>
              You may request cancellation <strong>before we dispatch</strong> by contacting us
              immediately on WhatsApp/phone at {settings.phoneDisplay} /{' '}
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                wa.me/{settings.whatsapp}
              </a>{' '}
              with your name/phone or order number (<code>OF-YYYY-…</code>).
            </li>
            <li>
              If dispatch or out-for-delivery has begun, cancellation may not be possible; we will
              advise you at the time.
            </li>
          </ul>
          <div className="legal-notice legal-notice--warn">
            A formal cancellation window (e.g., minutes after order) is not yet published in system
            code. Until it is, contact us as soon as possible — we handle cancellations fairly via
            the same WhatsApp/phone channel used for confirmation.
          </div>
          <p>
            No online cancellation button exists today; cancellation is handled via direct contact
            so we can verify before market preparation.
          </p>
        </section>

        <section id="returns-refusal" className="legal-section">
          <h2>8. Wrong / damaged / refused delivery</h2>
          <p>
            Seafood is perishable. Please check your order at delivery — correct product, weight and
            visible quality.
          </p>
          <ul>
            <li>
              If the product is wrong (species) or weight is materially short, tell the delivery
              team immediately or contact us within a short window with a photo via WhatsApp — we
              will address it with replacement or appropriate adjustment.
            </li>
            <li>
              For COD, there is no online “refund to card” — adjustments for genuine issues are
              handled as replacement or partial waiver on the spot or on next order, agreed via
              phone/WhatsApp.
            </li>
            <li>
              If you refuse a correct order at the door that was procured and dispatched as ordered,
              the order may be considered complete; please cancel before dispatch per Section 7
              instead.
            </li>
          </ul>
          <div className="legal-notice legal-notice--warn">
            A detailed SLA (e.g., “photo within 2 hours”) is not yet defined in business rules. The
            above is our current practice as implemented; a formal returns policy will be published
            here when confirmed.
          </div>
        </section>

        <section id="customer-duties" className="legal-section">
          <h2>9. Your responsibilities</h2>
          <ul>
            <li>Provide a reachable phone and an address within our service area</li>
            <li>Be available at delivery or designate someone to receive and pay COD</li>
            <li>Store seafood appropriately after delivery (refrigerate promptly)</li>
            <li>
              Keep your phone/WhatsApp secure; WhatsApp confirmation relies on the number you give
              us
            </li>
          </ul>
        </section>

        <section id="acceptable-use" className="legal-section">
          <h2>10. Acceptable use</h2>
          <p>Do not use the storefront to:</p>
          <ul>
            <li>Place false or bulk orders with no intent to receive (these may be cancelled)</li>
            <li>Provide someone else’s address/phone without their consent</li>
            <li>Attempt to interfere with the site, checkout or database, or manipulate prices</li>
            <li>Scrape product data for resale without permission</li>
          </ul>
          <p>We may limit or decline service for misuse.</p>
        </section>

        <section id="ip" className="legal-section">
          <h2>11. Intellectual property</h2>
          <p>
            The storefront’s layout, product copy, prices and images (where owned) are our property
            or licensed to us. You may use the site to shop and share links. Do not copy catalog
            images or text at scale for commercial reuse without permission. Third-party marks
            (e.g., WhatsApp, Google) belong to their owners.
          </p>
        </section>

        <section id="availability-liability" className="legal-section">
          <h2>12. Service availability and liability</h2>
          <p>
            We work to keep the storefront available during shop hours but availability is not
            guaranteed — maintenance, connectivity or market conditions may cause interruption.
          </p>
          <ul>
            <li>
              Seafood is a market commodity — supply, species and size may vary; we may substitute
              only with your prior confirmation.
            </li>
            <li>
              To the extent permitted by applicable law, our liability for any order is limited to
              the amount you paid (or were to pay) for that order (its total). We are not liable for
              indirect losses beyond the order value where permitted.
            </li>
            <li>
              Nothing in these Terms limits rights you have as a consumer under applicable Indian
              law which cannot be waived.
            </li>
          </ul>
          <p>
            We make no claim that our data handling is “bank-level” beyond Supabase/HTTPS
            protections described in the Privacy Policy.
          </p>
        </section>

        <section id="law" className="legal-section">
          <h2>13. Governing law and grievance</h2>
          <p>
            These Terms are governed by the laws of India. Courts at the location of our shop
            address ({settings.addressLines[1]}) will have jurisdiction, subject to applicable
            consumer forum rights.
          </p>
          <p>
            For order issues, first contact us via WhatsApp/phone/email above — we aim to resolve
            promptly at shop level. For formal grievance enquiries, write to{' '}
            <a href={`mailto:${settings.email}`}>{settings.email}</a> with subject “Grievance” and
            your order phone/name. We will respond within a reasonable time where required. When a
            dedicated Grievance Officer is appointed, we will list the name, email and phone here
            with response timelines.
          </p>
          <div className="legal-notice">
            Regulatory applicability (DPDP Act, Consumer Protection, IT Act) should be verified with
            counsel for your business structure. This text describes our implemented storefront; it
            is not legal advice.
          </div>
        </section>

        <section id="contact" className="legal-section">
          <h2>14. Contact</h2>
          <div className="legal-contact">
            <div className="legal-contact__row">
              <strong>{settings.storeName}</strong> · {settings.tagline}
            </div>
            <div className="legal-contact__row">
              <strong>Address:</strong> {settings.addressLines[0]}, {settings.addressLines[1]}
            </div>
            <div className="legal-contact__row">
              <strong>Email:</strong> <a href={`mailto:${settings.email}`}>{settings.email}</a>
            </div>
            <div className="legal-contact__row">
              <strong>Phone / WhatsApp:</strong>{' '}
              <a href={`tel:${settings.phoneRaw}`}>{settings.phoneDisplay}</a> ·{' '}
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                wa.me/{settings.whatsapp}
              </a>
            </div>
            <div className="legal-contact__row">
              <strong>Hours:</strong> {settings.hours.join(' · ')}
            </div>
          </div>
          <div className="legal-actions">
            <Link to="/privacy" className="btn btn-outline-dark btn-sm">
              Privacy Policy
            </Link>
            <Link to="/cookie-policy" className="btn btn-outline-dark btn-sm">
              Cookie Policy
            </Link>
            <Link to="/contact" className="btn btn-outline-dark btn-sm">
              Contact & Directions
            </Link>
          </div>
        </section>

        <section id="changes" className="legal-section">
          <h2>15. Changes to Terms</h2>
          <p>
            When we update these Terms, we will update the “Last updated” date above and publish the
            new version here. Continued ordering after changes means you accept the updated Terms.
            If we introduce online payment, a dedicated payment section will be added before it goes
            live.
          </p>
        </section>

        <div className="legal-footer">
          These Terms reflect OceanFresh’s implemented ordering flow (COD, WhatsApp, localStorage
          cart, verified pricing). They are not copied from another company. For legal advice
          specific to your situation, consult qualified counsel. Related:{' '}
          <Link to="/privacy">Privacy Policy</Link> · <Link to="/cookie-policy">Cookie Policy</Link>
          .
        </div>
      </div>
      <Footer />
    </div>
  );
}
