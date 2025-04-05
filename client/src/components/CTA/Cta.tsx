import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Cta = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 py-16 sm:py-24">
      {/* Background Pattern */}
      <div className="bg-grid-pattern absolute inset-0 opacity-5"></div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Ready to Make a Difference?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Join our community of helpers and start making a positive impact
            today.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {/* Create Request Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <div className="relative">
              <h3 className="text-xl font-semibold text-gray-900">
                Create a Request
              </h3>
              <p className="mt-2 text-gray-600">
                Share your story and let others know how they can help you.
              </p>
              <Link
                to="/request"
                className="mt-6 inline-flex items-center text-blue-600 hover:text-blue-700"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Browse Requests Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <div className="relative">
              <h3 className="text-xl font-semibold text-gray-900">
                Browse Requests
              </h3>
              <p className="mt-2 text-gray-600">
                Find people in need and extend a helping hand.
              </p>
              <Link
                to="/requests"
                className="mt-6 inline-flex items-center text-green-600 hover:text-green-700"
              >
                View Requests
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* FAQ Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl sm:col-span-full">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <div className="relative">
              <h3 className="text-xl font-semibold text-gray-900">
                Have Questions?
              </h3>
              <p className="mt-2 text-gray-600">
                Check out our FAQ section for answers to common questions.
              </p>
              <Link
                to="/faq"
                className="mt-6 inline-flex items-center text-purple-600 hover:text-purple-700"
              >
                View FAQ
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 shadow-lg">
            <p className="text-lg font-medium text-gray-900">
              Need help?{" "}
              <Link to="/contact" className="text-blue-600 hover:text-blue-700">
                Contact us
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cta;
