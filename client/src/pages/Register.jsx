import React, { useState } from "react";
import { Oval } from "react-loader-spinner";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    setIsLoading(true);
    setErrorMessages("")
    e.preventDefault();
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    console.log("Response:", data);
    if (res.ok) {
      setIsLoading(false);
      navigate(`/check-email/${data.user.id}`);
    } else {
      setErrorMessages(data.msg);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="min-h-screen flex items-center justify-center w-full bg-gray-700">
        <div className=" bg-slate-600 shadow-md rounded-lg px-8 py-6 max-w-sm">
          <h1 className="text-2xl font-bold text-center mb-4 dark:text-gray-200">
            Register
          </h1>
          {errorMessages && (
            <p className="mb-3 p-2 bg-red-800 text-white text-sm opacity-75 rounded-lg">
              {errorMessages}
            </p>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                for="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                className="shadow-sm bg-gray-300 rounded-md w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter username"
                required
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <label
                for="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                className="shadow-sm bg-gray-300 rounded-md w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter email"
                required
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <label
                for="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                className="shadow-sm bg-gray-300  rounded-md w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter password"
                required
                onChange={handleChange}
              />
            </div>
            <div className="text-end mb-4">
              {/* <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 rounded border-gray-300 text-gray-700 focus:ring-gray-500 focus:outline-none"
                  defaultChecked
                />
                <label
                  for="remember"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  Remember me
                </label>
              </div> */}
              <Link
                to="/login"
                className="text-xs text-white  hover:outline-3 hover:ring-2 hover:ring-offset-2 hover:ring-gray-500"
              >
                Login
              </Link>
            </div>
            {isLoading ? (
              <div
                style={{
                  margin: "auto",
                }}
              >
                <Oval
                  height="30"
                  width="30"
                  color="#383B53"
                  ariaLabel="tail-spin-loading"
                  radius="2"
                  wrapperStyle={{}}
                  wrapperClass=""
                  visible={true}
                />
              </div>
            ) : (
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:opacity-85"
              >
                Register
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
