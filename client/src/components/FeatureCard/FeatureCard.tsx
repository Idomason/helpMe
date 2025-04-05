import { IFeature } from "../../utils/types";

export default function FeatureCard({ feature }: IFeature) {
  return (
    <div className="mb-2 h-full w-64 rounded-md bg-helpMe-950 px-4 shadow-2xl lg:w-72">
      <div className="flex flex-col items-center justify-center gap-4 px-2 py-4">
        <span className="rounded-full bg-helpMe-700/70 px-4 py-2 font-bold text-helpMe-100 shadow-2xl xl:text-xl">
          {feature.id}
        </span>

        <h2 className="py-3 text-center font-semibold uppercase text-helpMe-100 lg:text-lg">
          {feature.title}
        </h2>

        <p className="text-left text-helpMe-300 xl:text-[16.5px]">
          {feature.body}
        </p>
      </div>
    </div>
  );
}
