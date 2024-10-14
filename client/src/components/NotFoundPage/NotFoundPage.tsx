import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex h-full min-h-screen flex-col items-center justify-center bg-black">
      <h1 className="py-3 text-2xl font-semibold text-[#ff004f]">
        Page Not Found
      </h1>
      <Link
        className="rounded-sm bg-[#ff004f] px-5 py-3 text-white transition-colors duration-150 ease-in hover:bg-[#bc0038] hover:font-medium"
        to="/"
      >
        Go Back Home
      </Link>
    </div>
  );
}
