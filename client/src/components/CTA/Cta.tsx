import { Link } from "react-router-dom";
import { ArrowRight, FilePlus2, Search, HelpCircle, HandHeart } from "lucide-react";

const cards = [
  {
    title: "Create a Request",
    body: "Share your story and let others know how they can help you.",
    to: "/request",
    cta: "Get Started",
    Icon: FilePlus2,
    accent: "from-pink-500 to-rose-500",
  },
  {
    title: "Browse Requests",
    body: "Find people in need and extend a helping hand today.",
    to: "/all-help-requests",
    cta: "View Requests",
    Icon: Search,
    accent: "from-helpMe-500 to-helpMe-700",
  },
  {
    title: "Offer Free Help",
    body: "Are you a helper? Post an offer to support your community.",
    to: "/free-help/offers",
    cta: "Post an Offer",
    Icon: HandHeart,
    accent: "from-amber-500 to-orange-500",
  },
];

const Cta = () => {
  return (
    <section className="relative overflow-hidden bg-helpMe-950 py-20 sm:py-28">
      <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-helpMe-600/25 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-pink-500/20 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Make a Difference?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-helpMe-200/90">
            Join a community of verified helpers and start making a positive
            impact today.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <Link
              key={c.title}
              to={c.to}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-white/10"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${c.accent} shadow-lg`}>
                <c.Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">{c.title}</h3>
              <p className="mt-2 text-sm text-helpMe-200/80">{c.body}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-pink-400">
                {c.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>

        {/* Bottom contact strip */}
        <div className="mt-14 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm backdrop-blur">
            <HelpCircle className="h-4 w-4 text-pink-400" />
            <span className="text-helpMe-200">Need help getting started?</span>
            <Link to="/contact" className="font-semibold text-white underline-offset-2 hover:underline">
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cta;
