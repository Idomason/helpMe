import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <div className="h-screen w-full bg-helpMe-950 px-4 py-40 sm:px-6">
      <div className="heroWidth mx-auto flex h-full flex-col justify-center px-4 sm:px-6 md:w-11/12">
        <div className="grid grid-cols-1 items-center justify-center gap-2 md:grid-cols-2 lg:gap-6">
          {/* Text */}
          <div className="flex flex-col justify-self-center md:justify-self-start lg:justify-between lg:gap-4">
            <h1 className="self-center pl-5 text-[2.5rem] font-semibold leading-tight text-white sm:pl-0 md:self-start lg:text-start lg:text-6xl lg:leading-[1.10] xl:text-7xl xl:leading-[1.15]">
              Find <span className="text-pink-400">Help</span> <br />
              <span className="pl-10 text-pink-400 md:pl-0">Give </span>
              Hope
            </h1>
            <p className="text-md w-[85%] self-center py-5 pl-5 font-light tracking-wide text-helpMe-200 sm:w-1/2 sm:pl-0 md:w-4/5 md:self-start lg:self-start xl:text-lg">
              Connect with compassionate volunteers and receive the support you
              need.
            </p>
            <div className="flex items-center justify-center space-x-2 self-center pt-5 md:space-x-4 md:self-start">
              <Link
                className="sm:text-md transform rounded-lg bg-pink-400 px-2.5 py-3 text-sm font-semibold text-helpMe-100 shadow transition-all duration-300 ease-in-out hover:bg-pink-600 hover:text-helpMe-100 sm:px-2.5 lg:px-8 xl:px-10 xl:py-4 xl:text-lg"
                to={"/register"}
              >
                Join Our Community
              </Link>
              <Link
                className="border-1 sm:text-md transform rounded-lg border border-helpMe-300 px-2.5 py-3 text-sm font-medium text-helpMe-300 shadow transition-all duration-300 ease-in-out hover:border-helpMe-600 hover:text-helpMe-600 sm:px-2.5 lg:px-8 xl:px-10 xl:py-4 xl:text-lg"
                to={"/request"}
              >
                Post a Request
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="relative hidden justify-self-end rounded-lg bg-helpMe-200 p-4 md:block md:h-[300px] md:w-[300px] lg:h-[400px] lg:w-[400px]">
            <img
              className="absolute rounded-lg bg-pink-300 p-4 md:-left-3 md:top-3 lg:-left-6 lg:top-6"
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
