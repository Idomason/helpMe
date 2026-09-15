import { useState } from "react";
import toast from "react-hot-toast";
import { Link2, Check } from "lucide-react";

interface ShareButtonsProps {
  /** Full page URL to share. */
  url: string;
  /** Short title used to build the share text. */
  title: string;
  className?: string;
}

// Minimal inline brand marks — kept as small SVGs so we don't pull in a new
// icon-library dependency (lucide-react has no brand icons).
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12.014 2C6.486 2 2 6.486 2 12.014c0 1.98.577 3.897 1.663 5.541L2 22l4.556-1.634A9.96 9.96 0 0 0 12.014 22C17.542 22 22 17.514 22 12.014S17.542 2 12.014 2Zm0 18.145a8.09 8.09 0 0 1-4.377-1.279l-.314-.198-2.976 1.068.983-3.03-.204-.313a8.11 8.11 0 0 1-1.238-4.379c0-4.487 3.653-8.132 8.14-8.132 2.174 0 4.216.848 5.752 2.386a8.06 8.06 0 0 1 2.383 5.753c-.004 4.487-3.657 8.124-8.149 8.124Z" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.02 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.878h2.773l-.443 2.91h-2.33V22c4.78-.756 8.437-4.92 8.437-9.94Z" />
  </svg>
);

export default function ShareButtons({ url, title, className = "" }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const text = `${title} — help make this happen on HelpMe`;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  const links = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      Icon: WhatsAppIcon,
      className: "bg-[#25D366]/10 text-[#128C4A] hover:bg-[#25D366]/20",
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      Icon: XIcon,
      className: "bg-gray-900/5 text-gray-900 hover:bg-gray-900/10",
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      Icon: FacebookIcon,
      className: "bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20",
    },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {links.map(({ label, href, Icon, className: cls }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          title={`Share on ${label}`}
          aria-label={`Share on ${label}`}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-inset ring-gray-200/60 transition ${cls}`}
        >
          <Icon />
        </a>
      ))}
      <button
        type="button"
        onClick={copyLink}
        title="Copy link"
        aria-label="Copy link"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200/60 transition hover:bg-gray-200"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
