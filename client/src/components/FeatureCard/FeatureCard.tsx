import { IFeature } from "../../utils/types";

export default function FeatureCard({ feature }: IFeature) {
  return (
    <div className="h-96 w-72 rounded-md bg-helpMe-950 px-4">
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-8">
        <span className="rounded-full bg-helpMe-700/70 px-4 py-2 font-bold text-helpMe-100 shadow-2xl">
          {feature.id}
        </span>

        <h2 className="py-3 text-center font-semibold uppercase text-helpMe-100">
          {feature.title}
        </h2>

        <p className="text-left text-helpMe-300">{feature.body}</p>
      </div>
    </div>
  );
}
