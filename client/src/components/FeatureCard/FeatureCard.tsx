import { IFeature } from "../../utils/types";

export default function FeatureCard({ feature }: IFeature) {
  return (
    <div className="h-96 w-72 rounded-md bg-helpMe-950 px-4 shadow-2xl lg:w-80">
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-8">
        <span className="rounded-full bg-helpMe-700/70 px-4 py-2 font-bold text-helpMe-100 shadow-2xl xl:px-6 xl:py-4 xl:text-xl">
          {feature.id}
        </span>

        <h2 className="py-3 text-center font-semibold uppercase text-helpMe-100 lg:text-xl">
          {feature.title}
        </h2>

        <p className="text-left text-helpMe-300 xl:text-[17px]">
          {feature.body}
        </p>
      </div>
    </div>
  );
}
