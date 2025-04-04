import {
  Facebook,
  Instagram,
  SendHorizontal,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wider text-white">
              HELP ME
            </h2>
            <p className="text-sm text-gray-400">
              Empowering communities through collective support and meaningful
              connections.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 transition-colors hover:text-pink-400"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 transition-colors hover:text-pink-400"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 transition-colors hover:text-pink-400"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 transition-colors hover:text-pink-400"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  to="/requests"
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  Requests
                </Link>
              </li>
              <li>
                <Link
                  to="/giveaways"
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  Giveaways
                </Link>
              </li>
              <li>
                <Link
                  to="/helpers"
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  Helpers
                </Link>
              </li>
              <li>
                <Link
                  to="/helpees"
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  Helpees
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold text-white">Support</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/policy"
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/safety"
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  Safety Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Newsletter</h3>
              <p className="mt-2 text-sm text-gray-400">
                Subscribe to our newsletter for updates and news
              </p>
              <form className="mt-4 flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-l-lg border-0 bg-gray-800 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <button
                  type="submit"
                  className="rounded-r-lg bg-pink-500 px-4 py-2 text-white transition-colors hover:bg-pink-600"
                >
                  <SendHorizontal className="h-5 w-5" />
                </button>
              </form>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white">Contact Info</h3>
              <ul className="mt-4 space-y-3">
                <li className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-pink-500" />
                  <span className="text-sm text-gray-400">
                    support@helpme.com
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-pink-500" />
                  <span className="text-sm text-gray-400">
                    +234 (555) 123-4567
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-pink-500" />
                  <span className="text-sm text-gray-400">Lagos, Nigeria</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Help Me. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link
                to="/terms"
                className="text-sm text-gray-400 hover:text-white"
              >
                Terms of Service
              </Link>
              <Link
                to="/privacy"
                className="text-sm text-gray-400 hover:text-white"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
