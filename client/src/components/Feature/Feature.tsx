import { featureData } from "../../constant/constant";
import FeatureCard from "../FeatureCard/FeatureCard";

export default function Feature() {
  return (
    <div className="w-full bg-helpMe-200 py-12">
      <div className="mx-auto flex h-full w-4/5 flex-col items-center justify-center">
        <h1 className="py-6 text-xl font-semibold uppercase tracking-wide text-helpMe-600 md:text-2xl lg:text-3xl">
          HOW HELPME WORKS
        </h1>

        <ul className="mx-auto mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featureData &&
            featureData.length > 0 &&
            featureData.map((feature) => (
              <FeatureCard key={feature.id} feature={feature} />
            ))}
        </ul>
      </div>
    </div>
  );
}
