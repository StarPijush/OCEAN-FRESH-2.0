type SocialPlatform = 'instagram' | 'facebook' | 'whatsapp' | 'youtube';

interface SocialContactCardProps {
  platform: SocialPlatform;
  href: string;
  subtitle?: string;
  label?: string;
}

const TITLES: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  whatsapp: 'WhatsApp',
  youtube: 'YouTube',
};

const SUBTITLES: Record<SocialPlatform, string> = {
  instagram: 'Follow us',
  facebook: 'Follow us',
  whatsapp: 'Chat now',
  youtube: 'Watch us',
};

function PlatformIcon({ platform }: { platform: SocialPlatform }) {
  // Reused crisp brand SVGs from SocialLinks (no emoji, no new library)
  // Sized 20×20 to visually match existing WhatsApp card emoji weight in 52×52 container
  if (platform === 'instagram') {
    return (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (platform === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
        <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12z" />
      </svg>
    );
  }
  if (platform === 'youtube') {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
        <path d="M23 12s0-3.5-.45-5.18a2.82 2.82 0 0 0-1.98-1.98C18.88 4.39 12 4.39 12 4.39s-6.88 0-8.57.45a2.82 2.82 0 0 0-1.98 1.98C1 8.5 1 12 1 12s0 3.5.45 5.18a2.82 2.82 0 0 0 1.98 1.98c1.69.45 8.57.45 8.57.45s6.88 0 8.57-.45a2.82 2.82 0 0 0 1.98-1.98C23 15.5 23 12 23 12zm-13.2 3.6V8.4L16 12l-6.2 3.6z" />
      </svg>
    );
  }
  // whatsapp
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/**
 * Reusable social contact card — identical geometry to the WhatsApp reference card.
 * Card itself stays ivory/neutral; only icon container gets subtle platform tint (via CSS).
 * Arrow, padding, radius, min-height, spacing are all inherited from .contact-item.
 */
export function SocialContactCard({ platform, href, subtitle, label }: SocialContactCardProps) {
  const title = label ?? TITLES[platform];
  const sub = subtitle ?? SUBTITLES[platform];
  // WhatsApp already has --whatsapp modifier; others use subtle tint classes added in contact-premium.css
  const isAccent = platform === 'whatsapp';
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="contact-item"
      role="listitem"
      aria-label={title}
    >
      <div className="contact-item-left">
        <div className={`contact-item-icon contact-item-icon--${platform}`} aria-hidden="true">
          <PlatformIcon platform={platform} />
        </div>
        <div className="contact-item-text">
          <div className="contact-item-title">{title}</div>
          <div className={`contact-item-value ${isAccent ? 'contact-item-value--accent' : ''}`}>
            {sub}
          </div>
        </div>
      </div>
      <div className="contact-item-arrow" aria-hidden="true">
        ›
      </div>
    </a>
  );
}
