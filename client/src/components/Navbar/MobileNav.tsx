import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { IMobileNavProp } from "../../utils/types";
import BrandLogo from "../BrandLogo/BrandLogo";
import { useAuthUser } from "../../hooks/useAuthUser";

export default function MobileNav({ closeNavbar, isOpen }: IMobileNavProp) {
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(closeNavbar);
  close.current = closeNavbar;
  const { data: authUser } = useAuthUser();
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") close.current();
      if (event.key === "Tab") {
        const items = panel.current?.querySelectorAll<HTMLElement>("a, button");
        if (!items?.length) return;
        const first = items[0], last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", handler);
    return () => { document.body.style.overflow = overflow; document.removeEventListener("keydown", handler); previous?.focus(); };
  }, [isOpen]);
  if (!isOpen) return null;
  return <div className="site-mobile-menu" onClick={closeNavbar}>
    <div ref={panel} className="site-mobile-panel" role="dialog" aria-modal="true" aria-label="Navigation menu" onClick={e => e.stopPropagation()}>
      <div className="site-mobile-top"><div onClick={closeNavbar}><BrandLogo /></div><button type="button" onClick={closeNavbar} aria-label="Close navigation menu"><X size={23} /></button></div>
      <nav aria-label="Mobile navigation" onClick={closeNavbar}>
        <Link to="/all-help-requests">Explore requests</Link><Link to="/giveaways">Giveaways</Link><Link to="/giver-board">Givers-board</Link>
        {authUser ? <><Link to="/dashboard?tab=create-request">Request help</Link><Link to={authUser.role === "admin" ? "/admin" : "/dashboard"}>Dashboard</Link></> : <><Link to="/login">Log in</Link><Link to="/register">Join the community</Link></>}
      </nav>
    </div>
  </div>;
}
