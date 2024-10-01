export default function ShortHeader({ heading }: { heading: string }) {
  return (
    <div className="pb-12">
      <h2 className="max-w-max rounded-e-full bg-gradient-to-r from-helpMe-100 to-helpMe-950 px-8 py-2 font-medium capitalize text-white lg:px-12 lg:py-3">
        {heading}
      </h2>
    </div>
  );
}
