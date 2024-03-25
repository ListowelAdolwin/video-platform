import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo2.png";
import { useSelector } from "react-redux";

function HeaderNew() {
  const { currentUser } = useSelector((state) => state.user);
  return (
    <header className="mx-auto w-full max-w-screen-md bg-slate-600 py-3 shadow backdrop-blur-lg md:top-6 md:rounded-3xl lg:max-w-screen-lg">
      <div className="px-4">
        <div className="flex items-center justify-between">
          <div className="flex shrink-0">
            <Link
              className="flex items-center text-white font-semibold shadow-sm"
              to="/"
            >
              <img className="rounded-lg w-28" src={logo} alt="" />
            </Link>
          </div>
          {currentUser?.isAdmin && (
            <Link
              className="text-white items-center justify-center rounded-xl bg-gray-700 px-3 py-2 text-sm font-semibold shadow-sm transition-all duration-150 hover:opacity-95"
              to="/upload"
            >
              Upload Video
            </Link>
          )}
          {currentUser ? (
            <span className="text-white items-center justify-center rounded-xl bg-gray-700 px-3 py-2 text-sm font-semibold shadow-sm transition-all duration-150 hover:opacity-95">
              Hi, {currentUser.username}
            </span>
          ) : (
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
          )}
        </div>
      </div>
    </header>
  );
}

export default HeaderNew;
