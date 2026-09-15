import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, HeartHandshake, Sparkles } from "lucide-react";
import { IUser } from "../../utils/types";
import { useStats } from "../../hooks/useStats";

export default function Hero() {
  const { data: authUser } = useQuery<IUser>({ queryKey: ["authUser"] });
  const { data: stats } = useStats();

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-helpMe-950">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-helpMe-600/30 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-[28rem] w-[28rem] rounded-full bg-pink-500/20 blur-[130px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),transparent_55%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-5 pb-16 pt-28 sm:px-8 lg:pt-32">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Copy */}
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-helpMe-200 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-pink-400" />
              Verified helpers · Secure escrow
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              Find <span className="bg-gradient-to-r from-pink-400 to-helpMe-400 bg-clip-text text-transparent">Help</span>,
              <br />
              Give <span className="bg-gradient-to-r from-helpMe-400 to-pink-400 bg-clip-text text-transparent">Hope</span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base font-light leading-relaxed text-helpMe-200/90 sm:text-lg lg:mx-0">
              Connect with compassionate, verified volunteers and receive the
              support you need — with every transaction protected by secure escrow.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                to={
                  !authUser
                    ? "/register"
                    : authUser.role === "admin"
                      ? "/admin"
                      : "/dashboard"
                }
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-pink-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-pink-500/25 transition hover:bg-pink-600 hover:shadow-pink-500/40 sm:w-auto"
              >
                {!authUser ? "Join Our Community" : "Visit Dashboard"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to={authUser ? "/request" : "/login"}
                className="inline-flex w-full items-center justify-center rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:border-white/40 hover:bg-white/10 sm:w-auto"
              >
                {authUser ? "Post a Request" : "Login"}
              </Link>
            </div>

            {/* Trust stats */}
            <div className="mt-10 flex items-center justify-center gap-8 lg:justify-start">
              <div>
                <p className="text-2xl font-bold text-white">{stats?.totalRequests ?? 0}+</p>
                <p className="text-xs text-helpMe-300">Help Requests</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <p className="text-2xl font-bold text-white">{stats?.activeRequests ?? 0}</p>
                <p className="text-xs text-helpMe-300">Active Now</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <p className="text-2xl font-bold text-white">{stats?.totalGiveaways ?? 0}</p>
                <p className="text-xs text-helpMe-300">Giveaways</p>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative hidden lg:block">
            <div className="relative mx-auto aspect-square w-full max-w-md">
              {/* Frame */}
              <div className="absolute inset-6 rounded-3xl bg-gradient-to-br from-helpMe-600/40 to-pink-500/30 blur-2xl" />
              <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
                <img
                  src="/images/pic4.png"
                  alt="People helping each other"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-helpMe-950/60 via-transparent to-transparent" />
              </div>

              {/* Floating card: escrow */}
              <div className="absolute -left-6 top-10 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/95 px-4 py-3 shadow-xl backdrop-blur">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Secure Escrow</p>
                  <p className="text-[10px] text-gray-500">Funds held safely</p>
                </div>
              </div>

              {/* Floating card: verified */}
              <div className="absolute -right-4 bottom-12 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/95 px-4 py-3 shadow-xl backdrop-blur">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-50">
                  <HeartHandshake className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Verified Helpers</p>
                  <p className="text-[10px] text-gray-500">Trusted community</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
