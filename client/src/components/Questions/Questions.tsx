import { ChevronDoubleDownIcon } from "@heroicons/react/24/solid";

export default function Questions() {
  return (
    <div className="my-3 flex cursor-pointer items-center justify-between rounded-sm bg-helpMe-950 px-2 py-2 shadow">
      <span className="rounded-full bg-pink-400 px-3.5 py-1.5 font-medium text-white">
        1
      </span>
      <p className="text-white">
        How can I verify my identity on the platform?
      </p>
      <ChevronDoubleDownIcon className="size-6 cursor-pointer text-pink-400" />
    </div>
  );
}
