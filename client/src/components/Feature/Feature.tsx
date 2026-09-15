import { FileText, Users, ShieldCheck, Trophy } from "lucide-react";
import { featureData } from "../../constant/constant";

const icons = [FileText, Users, ShieldCheck, Trophy];
const accents = [
  "from-pink-500 to-rose-500",
  "from-helpMe-500 to-helpMe-700",
  "from-blue-500 to-indigo-500",
  "from-amber-500 to-orange-500",
];

export default function Feature() {
  return (
    <section className="bg-gradient-to-b from-white to-gray-50 px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-helpMe-600">
            How it works
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Getting help in four simple steps
          </h2>
          <p className="mt-4 text-gray-500">
            A safe, transparent process built to connect people in need with those
            ready to help.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featureData.map((feature, i) => {
            const Icon = icons[i] || FileText;
            return (
              <div
                key={feature.id}
                className="group relative rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-helpMe-200 hover:shadow-xl"
              >
                <span className="absolute right-5 top-5 text-5xl font-bold text-gray-100 transition-colors group-hover:text-helpMe-100">
                  {String(feature.id).padStart(2, "0")}
                </span>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${accents[i]} shadow-lg`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-5 text-lg font-bold capitalize text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {feature.body.trim()}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
