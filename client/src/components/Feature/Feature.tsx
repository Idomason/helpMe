import { featureData } from "../../constant/constant";
import FeatureCard from "../FeatureCard/FeatureCard";

export default function Feature() {
  return (
    <div className="bg-helpMe-200 px-4 py-12">
      <div className="mx-auto flex h-full flex-col items-center justify-center md:w-11/12 xl:w-full xl:px-5">
        <h1 className="mb-6 py-6 text-xl font-semibold uppercase tracking-wide text-helpMe-600 md:text-2xl lg:text-3xl">
          HOW{" "}
          <span className="font-semiBold rounded-lg bg-pink-400 p-1.5 text-helpMe-950">
            HELPME
          </span>{" "}
          WORKS
        </h1>

        <ul className="mx-auto mt-4 grid grid-cols-1 place-items-center gap-6 sm:grid-cols-2 xl:grid-cols-4 xl:gap-3">
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
