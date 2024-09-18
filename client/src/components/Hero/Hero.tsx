import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <div className="h-screen w-full bg-helpMe-950 px-4 py-40 sm:px-6">
      <div className="mx-auto flex h-full flex-col justify-center px-4 sm:px-6 md:w-11/12">
        <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-2">
          {/* Text */}
          <div>
            <h1 className="text-5xl font-semibold leading-tight text-helpMe-100 lg:text-6xl xl:text-7xl">
              Find Help. Give <br />
              Hope.
            </h1>
            <p className="text-md py-5 font-light tracking-wide text-helpMe-400 xl:text-lg">
              Connect with compassionate volunteers and receive <br />
              the support you need.
            </p>
            <div className="flex items-center justify-center space-x-2 pt-5 md:justify-start md:space-x-4">
              <Link
                className="transform rounded-lg bg-pink-400 px-8 py-3 font-semibold text-helpMe-100 shadow transition-all duration-300 ease-in-out hover:bg-pink-600 hover:text-helpMe-100 xl:px-10 xl:py-4 xl:text-lg"
                to={"/register"}
              >
                Join Our Community
              </Link>
              <Link
                className="border-1 transform rounded-lg border border-helpMe-300 px-8 py-3 font-medium text-helpMe-300 shadow transition-all duration-300 ease-in-out hover:border-helpMe-600 hover:text-helpMe-600 xl:px-10 xl:py-4 xl:text-lg"
                to={"/request"}
              >
                Post a Request
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="hidden rounded-lg bg-helpMe-200 p-4 md:block">
            <img
              className="h-[400px]"
              src="/images/pic4.png"
              width={800}
              height={600}
              alt=""
            />
          </div>
        </div>
      </div>
    </div>
  );
}
