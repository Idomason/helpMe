import { HeartHandshake } from "lucide-react";
import { Link } from "react-router-dom";
import "./BrandLogo.css";

export default function BrandLogo() {
  return <Link to="/" className="brand-logo" aria-label="HelpMe home"><HeartHandshake size={28} strokeWidth={1.8} />helpMe<span>.</span></Link>;
}
