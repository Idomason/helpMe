import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, HeartHandshake } from "lucide-react";
import "./AuthLayout.css";
import BrandLogo from "../BrandLogo/BrandLogo";

export default function AuthLayout({ children, register = false }: { children: ReactNode; register?: boolean }) {
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <header className="auth-nav">
          <BrandLogo />
          <Link to="/" className="auth-back"><ArrowLeft size={15} /> Back to home</Link>
        </header>
        <div className="auth-content">
          <div className="auth-heading">
            <span className="auth-eyebrow">{register ? "A little help starts here" : "Your community awaits"}</span>
            <h1>{register ? "Make room for good." : "Welcome back."}</h1>
            <p>{register ? "Create an account to ask for support, lend a hand, and make a difference." : "Log in to follow your requests, support others, and pick up where you left off."}</p>
          </div>
          {children}
          <p className="auth-switch">{register ? "Already part of the community?" : "New to helpMe?"} <Link to={register ? "/login" : "/register"}>{register ? "Log in" : "Create an account"}<ArrowUpRight size={15} /></Link></p>
        </div>
        <footer className="auth-footer">A community built on care. One connection at a time.</footer>
      </section>
      <aside className="auth-story" aria-label="The HelpMe community">
        <img src="/images/pic1.png" alt="Community members working together" />
        <div className="auth-story-shade" />
        <span className="auth-story-label"><span /> People helping people</span>
        <div className="auth-story-copy"><p>Small acts.<br />Real <em>impact.</em></p><div className="auth-story-rule" /><span>Ask for what you need.<br />Give what you can. Grow together.</span></div>
        <div className="auth-story-footer"><HeartHandshake size={21} /><span>Support starts with a connection.</span></div>
      </aside>
    </main>
  );
}
