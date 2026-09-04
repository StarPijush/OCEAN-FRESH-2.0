import { formatLegalDate, LEGAL_LAST_UPDATED_ISO } from '@oceanfresh/shared';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Footer } from '../../components/layout/Footer.js';
import { useSettings } from '../../context/settings-context.js';

export function PrivacyPolicyPage() {
  const settings = useSettings();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div id="page-privacy" className="page active">
      <div className="legal-shell">
        <p className="legal-eyebrow">Legal · Privacy</p>
        <h1 className="legal-title">Privacy Policy</h1>
        <div className="legal-rule" aria-hidden="true" />
        <p className="legal-updated">
          <strong>Last updated:</strong> {formatLegalDate(LEGAL_LAST_UPDATED_ISO)} · OceanFresh,
          Jhargram · This policy explains what information we collect, how we use it, and the
          choices you have. It is written for OceanFresh’s actual storefront as built — Cash on
          Delivery, WhatsApp order handoff, and localStorage cart — not a copied template.
        </p>

        <div className="legal-summary" role="note" aria-label="Quick summary">
          <div className="legal-summary__label">Quick summary</div>
          <p className="legal-summary__text">
            We collect only what we need to take and deliver your seafood order in Jhargram: your
            name, phone, delivery address, cart items and (if you tap “Use My Current Location”)
            your precise location. We do not collect card details — all orders are Cash on Delivery.
            We store orders in Supabase (our database) and send order details to our shop WhatsApp
            so we can confirm and deliver. We use only necessary browser storage (cart, login
            session and cookie consent choice); we do not use analytics or advertising cookies
            today. You can contact us at <a href={`mailto:${settings.email}`}>{settings.email}</a>{' '}
            to access or request deletion of your order information.
          </p>
        </div>

        <nav className="legal-toc" aria-label="Contents">
          <div className="legal-toc__title">On this page</div>
          <ol className="legal-toc__list">
            <li>
              <a href="#who-we-are">1. Who we are</a>
            </li>
            <li>
              <a href="#what-we-collect">2. Information we collect</a>
            </li>
            <li>
              <a href="#how-we-collect">3. How we collect it</a>
            </li>
            <li>
              <a href="#why-we-use">4. Why we use it</a>
            </li>
            <li>
              <a href="#orders-payments">5. Orders and payments (COD)</a>
            </li>
            <li>
              <a href="#delivery-comms">6. Delivery and communications</a>
            </li>
            <li>
              <a href="#third-parties">7. Third-party services</a>
            </li>
            <li>
              <a href="#cookies">8. Cookies and similar storage</a>
            </li>
            <li>
              <a href="#storage-retention">9. Where we store it and how long we keep it</a>
            </li>
            <li>
              <a href="#security">10. How we protect it</a>
            </li>
            <li>
              <a href="#your-rights">11. Your rights and choices</a>
            </li>
            <li>
              <a href="#deletion">12. Deletion requests</a>
            </li>
            <li>
              <a href="#children">13. Children’s information</a>
            </li>
            <li>
              <a href="#changes">14. Changes to this policy</a>
            </li>
            <li>
              <a href="#contact">15. Contact</a>
            </li>
          </ol>
        </nav>

        <section id="who-we-are" className="legal-section">
          <h2>1. Who we are</h2>
          <p>
            <strong>OceanFresh</strong> is a seafood storefront serving Jhargram, West Bengal,
            India. We began in {settings.foundedYear} and source from the local market each morning
            for same-day delivery.
          </p>
          <div className="legal-contact">
            <div className="legal-contact__row">
              <strong>Trading as:</strong> {settings.storeName} · {settings.tagline}
            </div>
            <div className="legal-contact__row">
              <strong>Shop address:</strong> {settings.addressLines[0]}, {settings.addressLines[1]}
            </div>
            <div className="legal-contact__row">
              <strong>Email (privacy & support):</strong>{' '}
              <a href={`mailto:${settings.email}`}>{settings.email}</a>
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
              <strong>Hours:</strong> {settings.hours.join(' · ')}
            </div>
          </div>
          <div className="legal-notice">
            Our legal entity details (registration / GSTIN / FSSAI where applicable) are not yet
            published here. If you need an invoice with registration details, contact us at{' '}
            <a href={`mailto:${settings.email}`}>{settings.email}</a>. We will update this section
            when formal entity information is finalised. Grievance enquiries are currently handled
            via the same email and phone above.
          </div>
        </section>

        <section id="what-we-collect" className="legal-section">
          <h2>2. Information we collect</h2>
          <p>We only collect information that our storefront actually uses.</p>

          <div className="legal-table-wrap">
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Purpose</th>
                  <th>Required?</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Full name</td>
                  <td data-label="Purpose">Identify your order and delivery</td>
                  <td data-label="Required">Yes</td>
                </tr>
                <tr>
                  <td>Phone number</td>
                  <td data-label="Purpose">Confirm order and coordinate delivery</td>
                  <td data-label="Required">Yes</td>
                </tr>
                <tr>
                  <td>Delivery address</td>
                  <td data-label="Purpose">Deliver your order</td>
                  <td data-label="Required">Yes</td>
                </tr>
                <tr>
                  <td>Geolocation (lat/lng + Maps link)</td>
                  <td data-label="Purpose">
                    Improve delivery accuracy — only if you tap “Use My Current Location”
                  </td>
                  <td data-label="Required">Optional</td>
                </tr>
                <tr>
                  <td>Cart (products, weight, quantity, price)</td>
                  <td data-label="Purpose">Build the order and calculate total</td>
                  <td data-label="Required">Yes</td>
                </tr>
                <tr>
                  <td>Order record (order number, totals, status)</td>
                  <td data-label="Purpose">Fulfil, track and support your order</td>
                  <td data-label="Required">Yes</td>
                </tr>
                <tr>
                  <td>Email (only if you use login/OTP)</td>
                  <td data-label="Purpose">Authenticate you — storefront is guest-only today</td>
                  <td data-label="Required">Optional</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            We <strong>do not</strong> collect card numbers, bank details, UPI IDs, or other payment
            credentials — see Section 5. We do not use analytics identifiers today.
          </p>
        </section>

        <section id="how-we-collect" className="legal-section">
          <h2>3. How we collect it</h2>
          <ul>
            <li>
              <strong>You provide it:</strong> at checkout you type name, phone and address (
              <code>order.tsx</code> Full Name / Phone / Delivery Address fields).
            </li>
            <li>
              <strong>You optionally share location:</strong> tapping “Use My Current Location”
              calls your browser’s geolocation once; we do not track you in the background.
            </li>
            <li>
              <strong>From your browser storage:</strong> your cart is saved in{' '}
              <code>localStorage</code> (<code>fresh-catch-cart</code>) so it survives reloads until
              you clear it or complete checkout.
            </li>
            <li>
              <strong>From authentication (if used):</strong> email OTP pages exist for support;
              when used, Supabase Auth stores a session token in <code>localStorage</code>. Most
              customers order as guests without this.
            </li>
          </ul>
          <p>
            We do not collect information from third-party data brokers. We do not scan your device
            for contacts or files.
          </p>
        </section>

        <section id="why-we-use" className="legal-section">
          <h2>4. Why we use it</h2>
          <ul>
            <li>To create your order, confirm what you ordered and calculate the total</li>
            <li>To deliver to your address and, if shared, navigate via your Maps link</li>
            <li>To contact you about delivery timing or issues (phone / WhatsApp)</li>
            <li>To operate our database, keep a business record of orders, and handle support</li>
            <li>To comply with applicable law where required</li>
          </ul>
          <p>We do not sell your information or use it for third-party advertising.</p>
        </section>

        <section id="orders-payments" className="legal-section">
          <h2>5. Orders and payments (Cash on Delivery)</h2>
          <p>
            All storefront orders today are <strong>Cash on Delivery (COD)</strong>. You pay in cash
            when we deliver. There is no online card, UPI or wallet checkout in the storefront code
            (<code>order.service.ts:182</code> <code>method: &apos;COD&apos;</code>).
          </p>
          <ul>
            <li>We do not handle or store card numbers, CVVs, or payment credentials</li>
            <li>
              We verify product prices at order time against our database (tamper check) and record
              the total in Supabase
            </li>
            <li>Delivery fee and free-delivery threshold are shown at checkout and in our Terms</li>
            <li>
              No payment data is sent to a gateway today; no Razorpay or similar is integrated
            </li>
          </ul>
          <div className="legal-notice">
            If online payment is added in the future, this policy and our Terms will be updated to
            name the payment provider and what is shared with it. Card details would be handled by
            that provider, not stored by OceanFresh.
          </div>
        </section>

        <section id="delivery-comms" className="legal-section">
          <h2>6. Delivery and communications</h2>
          <h3>Delivery information</h3>
          <p>
            Your address (and Maps link if shared) is stored as the shipping snapshot for your order
            and visible to our shop team for delivery. Our serviceable pincodes and areas are listed
            in-store at checkout and on the Contact page.
          </p>
          <h3>WhatsApp</h3>
          <p>
            When you tap “Send Order via WhatsApp”, your browser opens{' '}
            <code>https://wa.me/{settings.orderWhatsApp}</code> with your order details pre-filled.
            That message is sent via WhatsApp (Meta) to our shop number{' '}
            <code>{settings.whatsapp}</code> so we can confirm and dispatch. WhatsApp’s own terms
            and privacy policy apply to messages once they leave OceanFresh. You can also reach us
            via the floating WhatsApp button or Contact page for support — those are WhatsApp links
            as well.
          </p>
          <p>
            We also use your phone for delivery coordination outside WhatsApp when needed. You can
            ask us to use phone instead of WhatsApp by contacting us.
          </p>
        </section>

        <section id="third-parties" className="legal-section">
          <h2>7. Third-party services</h2>
          <p>Only services actually used in the storefront are listed.</p>
          <div className="legal-table-wrap">
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Purpose</th>
                  <th>Data shared</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Supabase</td>
                  <td data-label="Purpose">Database, authentication and session storage</td>
                  <td data-label="Data">
                    Order and customer snapshots, auth email/tokens where used, consent choice
                  </td>
                </tr>
                <tr>
                  <td>WhatsApp (Meta)</td>
                  <td data-label="Purpose">Order confirmation and support</td>
                  <td data-label="Data">
                    Name, phone, cart, address, Maps link you choose to share, totals
                  </td>
                </tr>
                <tr>
                  <td>Vercel</td>
                  <td data-label="Purpose">Website hosting</td>
                  <td data-label="Data">IP and technical logs for delivery of the site</td>
                </tr>
                <tr>
                  <td>Google Fonts</td>
                  <td data-label="Purpose">Typography</td>
                  <td data-label="Data">IP and user-agent to fetch fonts (no cookies set by us)</td>
                </tr>
                <tr>
                  <td>Google Maps (links only)</td>
                  <td data-label="Purpose">Open location in Maps when tapped</td>
                  <td data-label="Data">Lat/lng you share, only if you open the link</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            We do not share order data with advertising networks or data brokers. If we add
            analytics later, we will list it here and gate it behind your consent.
          </p>
        </section>

        <section id="cookies" className="legal-section">
          <h2>8. Cookies and similar storage</h2>
          <p>
            OceanFresh does <strong>not</strong> set third-party tracking cookies today. We use{' '}
            <code>localStorage</code> — browser storage similar to cookies — for strictly necessary
            functions:
          </p>
          <div className="legal-card">
            <div className="legal-card__title">Strictly necessary (always active)</div>
            <div className="legal-card__meta">
              <strong>fresh-catch-cart</strong> — cart items so checkout survives reloads · until
              you clear site data · <strong>oceanfresh.auth.session</strong> — session timers when
              signed in · until logout/expiry · <strong>sb-*-auth-token</strong> — Supabase JWT for
              auth (storefront persisted; admin is memory-only).
            </div>
          </div>
          <div className="legal-card">
            <div className="legal-card__title">Optional (consent-gated, currently OFF)</div>
            <div className="legal-card__meta">
              <strong>Analytics · Preferences · Marketing</strong> — infrastructure exists but no
              cookies are set today. No analytics, preference or marketing scripts load before you
              give consent (<code>oceanfresh-cookie-consent</code>). You can manage them in{' '}
              <Link to="/cookie-policy">Cookie Policy</Link>.
            </div>
          </div>
          <p>
            You can manage consent at any time via <Link to="/cookie-policy">Cookie Policy</Link> →
            Cookie Settings. Clearing your browser’s site data removes cart and consent choice;
            signing out clears the auth token. See our full{' '}
            <Link to="/cookie-policy">Cookie Policy</Link> for the complete table.
          </p>
        </section>

        <section id="storage-retention" className="legal-section">
          <h2>9. Where we store it and how long we keep it</h2>
          <p>
            Orders and customer snapshots are stored in <strong>Supabase Postgres</strong> (our
            hosted database) with Row Level Security. The cart lives in your browser until you clear
            it or complete checkout. Consent choice is stored in your browser as{' '}
            <code>oceanfresh-cookie-consent</code>.
          </p>
          <div className="legal-notice">
            <strong>Retention:</strong> We keep order records as business records for fulfilment and
            support. There is no automatic deletion schedule in code today; orders remain until a
            legal retention or deletion request applies. If you have a specific retention query,
            contact us at <a href={`mailto:${settings.email}`}>{settings.email}</a> — we will
            clarify and will update this section when a formal retention schedule is published.
          </div>
          <p>We retain consent records until you change or clear them.</p>
        </section>

        <section id="security" className="legal-section">
          <h2>10. How we protect it</h2>
          <p>We use measures consistent with our current implementation:</p>
          <ul>
            <li>Transport over HTTPS via Vercel and Supabase</li>
            <li>
              Database Row Level Security — customers can only access their own records where an
              account is used, and guest orders are created via the <code>place_cod_order</code>{' '}
              function which validates and enforces <code>user_id NULL</code> for guests
            </li>
            <li>
              Supabase Auth JWTs stored in browser localStorage for the storefront (admin is
              memory-only)
            </li>
          </ul>
          <p>
            No system is completely secure. We do not claim “bank-level encryption” beyond what
            Supabase and HTTPS provide. If you believe your account may be compromised, contact us
            immediately. Avoid sending sensitive information over unsecured channels and be mindful
            that WhatsApp messages are transmitted via WhatsApp.
          </p>
        </section>

        <section id="your-rights" className="legal-section">
          <h2>11. Your rights and choices</h2>
          <p>Depending on applicable law, you may have rights to:</p>
          <ul>
            <li>Know what order information we hold about you</li>
            <li>Correct inaccurate information before dispatch</li>
            <li>
              Request deletion or anonymisation where it is not required to be retained for legal or
              accounting reasons
            </li>
            <li>
              Withdraw optional location sharing at any time (do not tap, or do not open Maps links)
            </li>
            <li>
              Manage cookie categories via <Link to="/cookie-policy">Cookie Settings</Link>
            </li>
          </ul>
          <p>
            We will respond within a reasonable time where required. Where requests affect pending
            delivery or legal obligations, we will explain what we can and cannot do.
          </p>
        </section>

        <section id="deletion" className="legal-section">
          <h2>12. Deletion requests</h2>
          <p>We do not offer automated self-service deletion in the storefront today.</p>
          <p>
            To request deletion or anonymisation, email{' '}
            <a href={`mailto:${settings.email}`}>{settings.email}</a> with your order phone number
            and, if available, order number (<code>OF-YYYY-…</code>). We will verify your request
            and delete or anonymise your customer snapshot where we are not required to retain it
            for legal, tax or audit purposes. We will confirm the outcome by the same channel where
            allowed.
          </p>
        </section>

        <section id="children" className="legal-section">
          <h2>13. Children’s information</h2>
          <p>
            OceanFresh sells food for household delivery and does not knowingly collect information
            directly from children. Orders should be placed by an adult. If you believe a child’s
            information has been provided, contact us and we will address it promptly.
          </p>
        </section>

        <section id="changes" className="legal-section">
          <h2>14. Changes to this policy</h2>
          <p>
            When we change this policy, we will update the “Last updated” date above and publish the
            updated version here. For meaningful changes we will also highlight them in the
            storefront where appropriate. Continued use after changes means you accept the updated
            policy.
          </p>
        </section>

        <section id="contact" className="legal-section">
          <h2>15. Contact</h2>
          <p>For privacy questions, rights requests or grievance enquiries:</p>
          <div className="legal-contact">
            <div className="legal-contact__row">
              <strong>{settings.storeName}</strong> · {settings.tagline}
            </div>
            <div className="legal-contact__row">
              <strong>Address:</strong> {settings.addressLines[0]}, {settings.addressLines[1]}
            </div>
            <div className="legal-contact__row">
              <strong>Email:</strong> <a href={`mailto:${settings.email}`}>{settings.email}</a>{' '}
              (privacy & grievance)
            </div>
            <div className="legal-contact__row">
              <strong>Phone:</strong>{' '}
              <a href={`tel:${settings.phoneRaw}`}>{settings.phoneDisplay}</a> · WhatsApp:{' '}
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {settings.phoneDisplay}
              </a>
            </div>
            <div className="legal-contact__row">
              <strong>Hours:</strong> {settings.hours.join(' · ')}
            </div>
          </div>
          <p>
            If a dedicated Grievance Officer is appointed, we will list the officer’s name, email
            and phone here and note response timelines as required by applicable law.
          </p>
          <div className="legal-actions">
            <Link to="/terms" className="btn btn-outline-dark btn-sm">
              Terms & Conditions
            </Link>
            <Link to="/cookie-policy" className="btn btn-outline-dark btn-sm">
              Cookie Policy
            </Link>
            <Link to="/contact" className="btn btn-outline-dark btn-sm">
              Contact & Directions
            </Link>
          </div>
        </section>

        <div className="legal-footer">
          This Privacy Policy describes OceanFresh’s actual storefront behavior as implemented
          (guest checkout, COD, WhatsApp handoff, Supabase storage, localStorage cart). It is not a
          copy of another company’s policy. For legal advice specific to your situation, consult
          qualified counsel. Related: <Link to="/terms">Terms & Conditions</Link> ·{' '}
          <Link to="/cookie-policy">Cookie Policy</Link>.
        </div>
      </div>
      <Footer />
    </div>
  );
}
