import React from "react";
import { Link } from "react-router-dom";

function HeaderNew() {
  return (
    <header className="mx-auto w-full max-w-screen-md bg-slate-600 py-3 shadow backdrop-blur-lg md:top-6 md:rounded-3xl lg:max-w-screen-lg">
      <div className="px-4">
        <div className="flex items-center justify-between">
          <div className="flex shrink-0">
            <Link
              className="flex items-center text-white font-semibold shadow-sm"
              to="/"
            >
              Video Platform
            </Link>
          </div>
          {/* <div className="hidden md:flex md:items-center md:justify-center md:gap-5">
            <a
              aria-current="page"
              className="inline-block rounded-lg px-2 py-1 text-sm font-medium text-gray-900 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900"
              href="#"
            >
              Home
            </a>
            <a
              className="inline-block rounded-lg px-2 py-1 text-sm font-medium text-gray-900 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900"
              href="#"
            >
              About
            </a>
          </div> */}
          <div className="flex items-center justify-end gap-3">
            <Link
              className="text-white items-center justify-center rounded-xl bg-gray-700 px-3 py-2 text-sm font-semibold shadow-sm transition-all duration-150 hover:opacity-95"
              to="/login"
            >
              Sign in
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-xl bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm"
              to="/register"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default HeaderNew;
